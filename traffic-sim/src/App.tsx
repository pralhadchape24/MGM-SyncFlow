import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";

type Axis = "x" | "z";
type Dir = 1 | -1;

interface CarProps {
  seed: number;
}

interface RoadProps {
  axis: Axis;
  center: number;
}

interface CrossProps {
  x: number;
  z: number;
}

interface BentRoadProps {
  axis: Axis;
  center: number;
  bendDir: Dir;
}

interface TrafficSignalProps {
  x: number;
  z: number;
  phaseOffset: number;
}

interface SignalIntersection {
  x: number;
  z: number;
  phaseOffset: number;
}

interface BlockBuilding {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
}

interface HospitalBuildingData {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  accent: string;
  variant: 1 | 2 | 3;
}

const SPACING = 40;
const GRID = 9;
const ROAD_W = 10;
const CAR_COUNT = 80;
const SIGNAL_CYCLE_SECONDS = 5;
const SIGNAL_RATIO = 0.6;

const CENTERS: number[] = Array.from({ length: GRID }, (_, i) => (i - (GRID - 1) / 2) * SPACING);

const MAP_HALF = CENTERS[GRID - 1] + SPACING * 0.6;
const ROAD_LEN = MAP_HALF * 2;
const GROUND_SZ = ROAD_LEN + SPACING * 2;

const TURN_CHANCE = 0.64;
const MAX_LATERAL = ROAD_W * 0.36;

const PALETTE = [
  "#e63946",
  "#457b9d",
  "#f4a261",
  "#2a9d8f",
  "#9b5de5",
  "#f72585",
  "#06d6a0",
  "#ffd166",
  "#ff6b35",
  "#3a86ff",
];

const BUILDING_COLORS = ["#8d99ae", "#6c757d", "#778da9", "#495057", "#7f8c8d"];
const BLOCK_OFFSETS: Array<[number, number]> = [
  [-8, -8],
  [8, -8],
  [-8, 8],
  [8, 8],
];

function hash01(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const signalIntersections: SignalIntersection[] = CENTERS.flatMap((x, xi) =>
  CENTERS.flatMap((z, zi) => {
    const weight = hash01((xi + 1) * 97 + (zi + 1) * 193 + 0.271);
    if (weight > SIGNAL_RATIO) return [];

    return [
      {
        x,
        z,
        phaseOffset: hash01((xi + 1) * 131 + (zi + 1) * 211 + 0.619) * SIGNAL_CYCLE_SECONDS * 3,
      },
    ];
  })
);

function pickBySeed<T>(arr: T[], seed: number): T {
  return arr[Math.floor(hash01(seed) * arr.length) % arr.length];
}

function dirFromSeed(seed: number): Dir {
  return hash01(seed) > 0.5 ? 1 : -1;
}

function randomDir(): Dir {
  return Math.random() > 0.5 ? 1 : -1;
}

function Car({ seed }: CarProps) {
  const ref = useRef<Mesh>(null!);

  const initial = useMemo(() => {
    const axis: Axis = hash01(seed + 1.1) > 0.5 ? "x" : "z";
    const center = pickBySeed(CENTERS, seed + 2.2);
    const dir = dirFromSeed(seed + 3.3);
    const alongBase = pickBySeed(CENTERS, seed + 4.4);
    const along = alongBase + (hash01(seed + 5.5) - 0.5) * SPACING * 0.6;
    const speed = 3 + hash01(seed + 6.6) * 5;
    const lateralOffset = (hash01(seed + 7.7) - 0.5) * 2 * MAX_LATERAL;
    const color = pickBySeed(PALETTE, seed + 8.8);

    return { axis, center, dir, along, speed, lateralOffset, color };
  }, [seed]);

  const axis = useRef<Axis>(initial.axis);
  const center = useRef<number>(initial.center);
  const dir = useRef<Dir>(initial.dir);
  const along = useRef<number>(initial.along);
  const speed = useRef<number>(initial.speed);
  const lateral = useRef<number>(initial.lateralOffset);
  const color = initial.color;

  // Signal-aware intersection tracking
  const lastInt = useRef<number | null>(null);

  // Lerp targets for smooth motion
  const currentPos = useRef(new THREE.Vector3());
  const currentRot = useRef(0);

  // Turn animation state
  const isTurning = useRef(false);
  const turnProgress = useRef(0);
  const turnStartPos = useRef(new THREE.Vector3());
  const turnEndPos = useRef(new THREE.Vector3());
  const turnStartRot = useRef(0);
  const turnEndRot = useRef(0);

  // Speed state for smooth acceleration/deceleration
  const currentSpeed = useRef(initial.speed);

  // Get signal phase for a given intersection (-1 = no signal)
  const getSignalPhase = (intX: number, intZ: number, time: number): number => {
    for (const sig of signalIntersections) {
      if (Math.abs(sig.x - intX) < 0.5 && Math.abs(sig.z - intZ) < 0.5) {
        return Math.floor(((time + sig.phaseOffset) / SIGNAL_CYCLE_SECONDS) % 3);
      }
    }
    return -1;
  };

  // Find the next intersection ahead in current direction
  const findNextIntersection = (time: number): { dist: number; pos: number; isRed: boolean } | null => {
    let bestDist = Infinity;
    let bestPos: number | null = null;

    for (const rc of CENTERS) {
      const dist = (rc - along.current) * dir.current;
      if (dist > 0.5 && dist < bestDist) {
        bestDist = dist;
        bestPos = rc;
      }
    }

    if (bestPos === null) return null;

    // Get the intersection coordinates
    const intX = axis.current === "x" ? bestPos : center.current + lateral.current;
    const intZ = axis.current === "z" ? bestPos : center.current + lateral.current;
    const phase = getSignalPhase(intX, intZ, time);

    return {
      dist: bestDist,
      pos: bestPos,
      isRed: phase === 0,
    };
  };

  useFrame(({ clock }, dt) => {
    const time = clock.getElapsedTime();
    const mesh = ref.current;
    if (!mesh) return;

    // Check if we're currently stopped at a red light
    const nextInt = findNextIntersection(time);

    if (nextInt && nextInt.isRed && nextInt.dist < 2) {
      // At red light - stop before intersection
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, dt * 8);

      // Snap to stop line (slightly before intersection)
      const stopLine = nextInt.pos - dir.current * 1.5;
      along.current = THREE.MathUtils.lerp(along.current, stopLine, dt * 10);

      // Update mesh position directly for stopping
      if (axis.current === "x") {
        mesh.position.set(along.current, 0.9, center.current + lateral.current);
      } else {
        mesh.position.set(center.current + lateral.current, 0.9, along.current);
      }
      return;
    }

    if (nextInt && nextInt.isRed && nextInt.dist < 12) {
      // Approaching red light - decelerate
      const decelFactor = Math.max(0.1, (nextInt.dist - 2) / 10);
      currentSpeed.current = THREE.MathUtils.lerp(
        currentSpeed.current,
        speed.current * decelFactor,
        dt * 4
      );
    } else if (nextInt && !nextInt.isRed) {
      // Green light - can accelerate back to normal speed
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, speed.current, dt * 2);
    } else {
      // No upcoming signal or passed it - normalize speed
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, speed.current, dt * 2);
    }

    // Handle turning animation
    if (isTurning.current) {
      turnProgress.current = Math.min(1, turnProgress.current + dt * 3);
      const t = THREE.MathUtils.smoothstep(turnProgress.current, 0, 1);

      mesh.position.lerpVectors(turnStartPos.current, turnEndPos.current, t);
      currentRot.current = THREE.MathUtils.lerp(turnStartRot.current, turnEndRot.current, t);
      mesh.rotation.y = currentRot.current;

      if (turnProgress.current >= 1) {
        isTurning.current = false;
        turnProgress.current = 0;
      }
      return;
    }

    // Normal movement
    along.current += dir.current * currentSpeed.current * dt;

    // Wrap around map
    if (along.current > MAP_HALF) along.current -= ROAD_LEN;
    if (along.current < -MAP_HALF) along.current += ROAD_LEN;

    // Intersection detection - only trigger when not stopped at red
    const snapDist = Math.max(1.5, currentSpeed.current * dt * 3);
    let hitIntersection: number | null = null;
    let closestDist = Infinity;

    for (const rc of CENTERS) {
      const dist = Math.abs(along.current - rc);
      if (dist <= snapDist && dist < closestDist) {
        hitIntersection = rc;
        closestDist = dist;
      }
    }

    if (hitIntersection !== null && hitIntersection !== lastInt.current) {
      lastInt.current = hitIntersection;

      // Check if we should turn at this intersection
      const intX = axis.current === "x" ? hitIntersection : center.current + lateral.current;
      const intZ = axis.current === "z" ? hitIntersection : center.current + lateral.current;
      const phase = getSignalPhase(intX, intZ, time);

      // Don't turn if stopping at red
      if (phase === 0 && nextInt && Math.abs(nextInt.pos - hitIntersection) < 1) {
        return;
      }

      const roll = Math.random();

      if (roll < TURN_CHANCE) {
        const oldCenter = center.current;
        const oldAxis = axis.current;
        const oldDir = dir.current;
        const newAxis: Axis = oldAxis === "x" ? "z" : "x";
        const newCenter = hitIntersection;
        const newAlong = oldCenter;
        const newDir = randomDir();
        const newLateral = (hash01(seed + Math.random() * 100) - 0.5) * 2 * MAX_LATERAL;

        // Calculate turn animation positions
        const startPos = oldAxis === "x"
          ? new THREE.Vector3(hitIntersection, 0.9, oldCenter + lateral.current)
          : new THREE.Vector3(oldCenter + lateral.current, 0.9, hitIntersection);

        const endPos = newAxis === "x"
          ? new THREE.Vector3(newAlong, 0.9, newCenter + newLateral)
          : new THREE.Vector3(newCenter + newLateral, 0.9, newAlong);

        const startRot = oldAxis === "x"
          ? (oldDir > 0 ? 0 : Math.PI)
          : (oldDir > 0 ? -Math.PI / 2 : Math.PI / 2);
        const endRot = newAxis === "x"
          ? (newDir > 0 ? 0 : Math.PI)
          : (newDir > 0 ? -Math.PI / 2 : Math.PI / 2);

        // Store turn state
        isTurning.current = true;
        turnProgress.current = 0;
        turnStartPos.current.copy(startPos);
        turnEndPos.current.copy(endPos);
        turnStartRot.current = startRot;
        turnEndRot.current = endRot;

        // Update logical state immediately
        axis.current = newAxis;
        center.current = newCenter;
        along.current = newAlong;
        dir.current = newDir;
        lateral.current = newLateral;
        lastInt.current = null;

        // Set initial position for turn animation
        mesh.position.copy(startPos);
        mesh.rotation.y = startRot;
        currentPos.current.copy(startPos);
        currentRot.current = startRot;

        return;
      }
    }

    if (hitIntersection === null) {
      lastInt.current = null;
    } else if (lastInt.current !== null && Math.abs(along.current - lastInt.current) > snapDist * 1.4) {
      lastInt.current = null;
    }

    lateral.current = Math.max(-MAX_LATERAL, Math.min(MAX_LATERAL, lateral.current));

    // Set target position with lerp
    let targetX: number, targetZ: number, targetRotY: number;

    if (axis.current === "x") {
      targetX = along.current;
      targetZ = center.current + lateral.current;
      targetRotY = dir.current > 0 ? 0 : Math.PI;
    } else {
      targetX = center.current + lateral.current;
      targetZ = along.current;
      targetRotY = dir.current > 0 ? -Math.PI / 2 : Math.PI / 2;
    }

    // Lerp to target
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX, dt * 10);
    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetZ, dt * 10);
    currentRot.current = THREE.MathUtils.lerp(currentRot.current, targetRotY, dt * 10);
    mesh.rotation.y = currentRot.current;
  });

  return (
    <mesh ref={ref} castShadow userData={{ isCar: true }}>
      <boxGeometry args={[3.2, 1.4, 1.9]} />
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
    </mesh>
  );
}

function Road({ axis, center }: RoadProps) {
  const hz = axis === "x";
  const n = Math.floor(ROAD_LEN / 10);

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={hz ? [0, 0.01, center] : [center, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={hz ? [ROAD_LEN, ROAD_W] : [ROAD_W, ROAD_LEN]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {Array.from({ length: n }, (_, i) => {
        const p = -ROAD_LEN / 2 + i * 10 + 5;
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={hz ? [p, 0.02, center] : [center, 0.02, p]}
          >
            <planeGeometry args={hz ? [5, 0.25] : [0.25, 5]} />
            <meshStandardMaterial color="#d4a017" />
          </mesh>
        );
      })}

      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          rotation={[-Math.PI / 2, 0, 0]}
          position={
            hz
              ? [0, 0.02, center + s * (ROAD_W / 2 - 0.2)]
              : [center + s * (ROAD_W / 2 - 0.2), 0.02, 0]
          }
        >
          <planeGeometry args={hz ? [ROAD_LEN, 0.35] : [0.35, ROAD_LEN]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      ))}
    </group>
  );
}

function BentRoad({ axis, center, bendDir }: BentRoadProps) {
  const firstLen = ROAD_LEN * 0.3;
  const midLen = ROAD_LEN * 0.22;
  const lastLen = ROAD_LEN * 0.3;
  const sideStep = SPACING * 0.55 * bendDir;

  if (axis === "x") {
    const leftCenter = -ROAD_LEN / 2 + firstLen / 2;
    const midCenter = -ROAD_LEN / 2 + firstLen + midLen / 2;
    const rightCenter = -ROAD_LEN / 2 + firstLen + midLen + lastLen / 2;
    const vLen = Math.abs(sideStep);

    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[leftCenter, 0.016, center]}>
          <planeGeometry args={[firstLen, ROAD_W]} />
          <meshStandardMaterial color="#242424" />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-ROAD_LEN / 2 + firstLen, 0.016, center + sideStep / 2]}>
          <planeGeometry args={[ROAD_W, vLen]} />
          <meshStandardMaterial color="#242424" />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[midCenter, 0.016, center + sideStep]}>
          <planeGeometry args={[midLen, ROAD_W]} />
          <meshStandardMaterial color="#242424" />
        </mesh>

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-ROAD_LEN / 2 + firstLen + midLen, 0.016, center + sideStep / 2]}
        >
          <planeGeometry args={[ROAD_W, vLen]} />
          <meshStandardMaterial color="#242424" />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[rightCenter, 0.016, center]}>
          <planeGeometry args={[lastLen, ROAD_W]} />
          <meshStandardMaterial color="#242424" />
        </mesh>
      </group>
    );
  }

  const lowCenter = -ROAD_LEN / 2 + firstLen / 2;
  const midCenter = -ROAD_LEN / 2 + firstLen + midLen / 2;
  const highCenter = -ROAD_LEN / 2 + firstLen + midLen + lastLen / 2;
  const hLen = Math.abs(sideStep);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center, 0.016, lowCenter]}>
        <planeGeometry args={[ROAD_W, firstLen]} />
        <meshStandardMaterial color="#242424" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center + sideStep / 2, 0.016, -ROAD_LEN / 2 + firstLen]}>
        <planeGeometry args={[hLen, ROAD_W]} />
        <meshStandardMaterial color="#242424" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center + sideStep, 0.016, midCenter]}>
        <planeGeometry args={[ROAD_W, midLen]} />
        <meshStandardMaterial color="#242424" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[center + sideStep / 2, 0.016, -ROAD_LEN / 2 + firstLen + midLen]}
      >
        <planeGeometry args={[hLen, ROAD_W]} />
        <meshStandardMaterial color="#242424" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center, 0.016, highCenter]}>
        <planeGeometry args={[ROAD_W, lastLen]} />
        <meshStandardMaterial color="#242424" />
      </mesh>
    </group>
  );
}

function Cross({ x, z }: CrossProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.013, z]}>
      <planeGeometry args={[ROAD_W, ROAD_W]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

function TrafficSignal({ x, z, phaseOffset }: TrafficSignalProps) {
  const redRef = useRef<Mesh>(null!);
  const yellowRef = useRef<Mesh>(null!);
  const greenRef = useRef<Mesh>(null!);

  const setEmissive = (mesh: Mesh, intensity: number) => {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const lightMaterial = material as unknown as { emissiveIntensity: number };
    lightMaterial.emissiveIntensity = intensity;
  };

  useFrame(({ clock }) => {
    const phase = Math.floor(((clock.getElapsedTime() + phaseOffset) / SIGNAL_CYCLE_SECONDS) % 3);

    setEmissive(redRef.current, phase === 0 ? 1.35 : 0.08);
    setEmissive(yellowRef.current, phase === 1 ? 1.35 : 0.08);
    setEmissive(greenRef.current, phase === 2 ? 1.35 : 0.08);
  });

  return (
    <group position={[x + ROAD_W * 0.34, 0, z + ROAD_W * 0.34]}>
      <mesh position={[0, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 4.8, 14]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>

      <mesh position={[0, 4.8, 0]} castShadow>
        <boxGeometry args={[1.5, 3, 1.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      <mesh ref={redRef} position={[0, 5.6, 0.6]}>
        <sphereGeometry args={[0.32, 14, 14]} />
        <meshStandardMaterial color="#ff2b2b" emissive="#ff2b2b" emissiveIntensity={0.12} />
      </mesh>

      <mesh ref={yellowRef} position={[0, 4.8, 0.6]}>
        <sphereGeometry args={[0.32, 14, 14]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.12} />
      </mesh>

      <mesh ref={greenRef} position={[0, 4, 0.6]}>
        <sphereGeometry args={[0.32, 14, 14]} />
        <meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.12} />
      </mesh>
    </group>
  );
}

function BuildingBlock({ data }: { data: BlockBuilding }) {
  return (
    <mesh position={[data.x, data.height / 2, data.z]} castShadow receiveShadow>
      <boxGeometry args={[data.width, data.height, data.depth]} />
      <meshStandardMaterial color={data.color} roughness={0.75} metalness={0.1} />
    </mesh>
  );
}

function HospitalBuilding({ data }: { data: HospitalBuildingData }) {
  if (data.variant === 1) {
    return (
      <group position={[data.x, 0, data.z]}>
        <mesh position={[0, data.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[data.width, data.height, data.depth]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.45} />
        </mesh>
        <mesh position={[0, data.height + 0.4, 0]} castShadow>
          <boxGeometry args={[4.2, 0.4, 1.1]} />
          <meshStandardMaterial color="#d90429" />
        </mesh>
        <mesh position={[0, data.height + 0.4, 0]} castShadow>
          <boxGeometry args={[1.1, 0.4, 4.2]} />
          <meshStandardMaterial color="#d90429" />
        </mesh>
      </group>
    );
  }

  if (data.variant === 2) {
    return (
      <group position={[data.x, 0, data.z]}>
        <mesh position={[-2.2, data.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[data.width * 0.58, data.height, data.depth]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[3.4, data.height * 0.36, 0]} castShadow receiveShadow>
          <boxGeometry args={[data.width * 0.5, data.height * 0.72, data.depth * 0.55]} />
          <meshStandardMaterial color="#e9ecef" roughness={0.5} />
        </mesh>
        <mesh position={[3.4, data.height * 0.74 + 0.2, 0]} castShadow>
          <cylinderGeometry args={[2.4, 2.4, 0.25, 28]} />
          <meshStandardMaterial color="#adb5bd" />
        </mesh>
        <mesh position={[3.4, data.height * 0.74 + 0.35, 0]} castShadow>
          <boxGeometry args={[1.9, 0.25, 0.5]} />
          <meshStandardMaterial color={data.accent} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[data.x, 0, data.z]}>
      <mesh position={[0, data.height * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[data.width, data.height * 0.7, data.depth]} />
        <meshStandardMaterial color="#f1f3f5" roughness={0.45} />
      </mesh>
      <mesh position={[0, data.height * 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[data.width * 0.55, data.height * 0.6, data.depth * 0.55]} />
        <meshStandardMaterial color="#dee2e6" roughness={0.45} />
      </mesh>
      <mesh position={[0, data.height * 1.2, 0]} castShadow>
        <sphereGeometry args={[1.1, 20, 20]} />
        <meshStandardMaterial color={data.accent} emissive={data.accent} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function generateCity() {
  const normalBuildings: BlockBuilding[] = [];
  const hospitals: HospitalBuildingData[] = [];

  const hospitalCells = [
    { ix: 1, iz: 1, variant: 1 as const, accent: "#d90429" },
    { ix: 6, iz: 2, variant: 2 as const, accent: "#ef233c" },
    { ix: 3, iz: 6, variant: 3 as const, accent: "#fb5607" },
  ];
  const hospitalSet = new Set(hospitalCells.map((h) => `${h.ix}-${h.iz}`));

  for (let ix = 0; ix < GRID - 1; ix++) {
    for (let iz = 0; iz < GRID - 1; iz++) {
      const cx = (CENTERS[ix] + CENTERS[ix + 1]) / 2;
      const cz = (CENTERS[iz] + CENTERS[iz + 1]) / 2;
      const key = `${ix}-${iz}`;

      if (hospitalSet.has(key)) {
        const h = hospitalCells.find((item) => item.ix === ix && item.iz === iz);
        if (h) {
          hospitals.push({
            x: cx,
            z: cz,
            width: 15 + h.variant,
            depth: 11 + h.variant,
            height: 11 + h.variant * 2.5,
            accent: h.accent,
            variant: h.variant,
          });
        }
        continue;
      }

      BLOCK_OFFSETS.forEach(([ox, oz], blockIndex) => {
        const seed = ix * 997 + iz * 131 + blockIndex * 17;
        const width = 3.8 + hash01(seed + 0.2) * 2.4;
        const depth = 3.8 + hash01(seed + 0.5) * 2.4;
        const height = 7 + hash01(seed + 0.9) * 22;
        const jitterX = (hash01(seed + 1.3) - 0.5) * 1.4;
        const jitterZ = (hash01(seed + 1.7) - 0.5) * 1.4;

        normalBuildings.push({
          x: cx + ox + jitterX,
          z: cz + oz + jitterZ,
          width,
          depth,
          height,
          color: pickBySeed(BUILDING_COLORS, seed + 2.1),
        });
      });
    }
  }

  return { normalBuildings, hospitals };
}

export default function App() {
  const carSeeds = useMemo(() => Array.from({ length: CAR_COUNT }, (_, i) => i + 1), []);
  const { normalBuildings, hospitals } = useMemo(() => generateCity(), []);

  const bentRoadMap = useMemo(() => {
    const map = new Map<string, Dir>();
    CENTERS.forEach((c, index) => {
      if (index > 0 && index < CENTERS.length - 1 && hash01(c * 0.017 + 41.2) < 0.55) {
        map.set(`x-${c}`, hash01(c * 0.09 + 12.3) > 0.5 ? 1 : -1);
      }
      if (index > 0 && index < CENTERS.length - 1 && hash01(c * 0.021 + 73.5) < 0.55) {
        map.set(`z-${c}`, hash01(c * 0.11 + 19.4) > 0.5 ? 1 : -1);
      }
    });
    return map;
  }, []);

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [280, 260, 280], fov: 45 }}
      shadows
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#87ceeb"]} />

      <ambientLight intensity={0.75} />
      <directionalLight position={[150, 200, 80]} intensity={1} castShadow />

      <OrbitControls
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={60}
        maxDistance={700}
        maxPolarAngle={Math.PI / 2.05}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[GROUND_SZ, GROUND_SZ]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {CENTERS.map((c) => (
        <Road key={`h-${c}`} axis="x" center={c} />
      ))}
      {CENTERS.map((c) => (
        <Road key={`v-${c}`} axis="z" center={c} />
      ))}

      {CENTERS.map((c) => {
        const bend = bentRoadMap.get(`x-${c}`);
        return bend ? <BentRoad key={`bx-${c}`} axis="x" center={c} bendDir={bend} /> : null;
      })}
      {CENTERS.map((c) => {
        const bend = bentRoadMap.get(`z-${c}`);
        return bend ? <BentRoad key={`bz-${c}`} axis="z" center={c} bendDir={bend} /> : null;
      })}

      {CENTERS.map((x) => CENTERS.map((z) => <Cross key={`${x}_${z}`} x={x} z={z} />))}

      {signalIntersections.map((signal, i) => (
        <TrafficSignal key={`sig-${i}`} x={signal.x} z={signal.z} phaseOffset={signal.phaseOffset} />
      ))}

      {normalBuildings.map((building, i) => (
        <BuildingBlock key={`b-${i}`} data={building} />
      ))}
      {hospitals.map((hospital, i) => (
        <HospitalBuilding key={`hosp-${i}`} data={hospital} />
      ))}

      {carSeeds.map((seed) => (
        <Car key={seed} seed={seed} />
      ))}
    </Canvas>
  );
}
