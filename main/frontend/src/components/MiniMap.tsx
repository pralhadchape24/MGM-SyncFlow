import { motion } from 'framer-motion';
import type { CCTV } from '../types/dashboard';
import { MapPin, Radio } from 'lucide-react';

interface MiniMapProps {
  cctvs: CCTV[];
  selectedCCTVId?: string | null;
  onSelectCCTV?: (id: string) => void;
}

export default function MiniMap({ cctvs, selectedCCTVId, onSelectCCTV }: MiniMapProps) {
  const emergencyCCTVs = cctvs.filter(c => c.status === 'EMERGENCY');
  const highTrafficCCTVs = cctvs.filter(c => c.status === 'HIGH_TRAFFIC');

  const getDotConfig = (cctv: CCTV) => {
    if (cctv.status === 'EMERGENCY') {
      return { color: '#ef4444', glow: true, size: 'lg' };
    }
    if (cctv.status === 'HIGH_TRAFFIC') {
      return { color: '#eab308', glow: false, size: 'md' };
    }
    return { color: '#22c55e', glow: false, size: 'sm' };
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)' }}
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="card-title">City Map</h3>
            <p className="card-subtitle">Camera Distribution</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-500">LIVE</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="p-4">
        <div className="relative h-44 rounded-lg bg-zinc-900 border border-zinc-800 map-grid overflow-hidden">
          {/* Road Network SVG */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Main roads */}
            <path
              d="M 0 50 Q 50 30 100 50"
              stroke="#22d3ee"
              strokeWidth="0.6"
              fill="none"
            />
            <path
              d="M 50 0 Q 60 50 50 100"
              stroke="#22d3ee"
              strokeWidth="0.6"
              fill="none"
            />
            {/* Secondary roads */}
            <path
              d="M 0 25 Q 40 35 100 20"
              stroke="#22d3ee"
              strokeWidth="0.3"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 0 75 Q 60 65 100 80"
              stroke="#22d3ee"
              strokeWidth="0.3"
              fill="none"
              opacity="0.6"
            />
          </svg>

          {/* City Zone Indicators */}
          <div className="absolute top-[12%] left-[8%] w-[28%] h-[22%] rounded-lg bg-green-500/5 border border-green-500/20" />
          <div className="absolute top-[38%] left-[58%] w-[32%] h-[28%] rounded-lg bg-yellow-500/5 border border-yellow-500/20" />
          <div className="absolute bottom-[12%] right-[8%] w-[22%] h-[18%] rounded-lg bg-red-500/5 border border-red-500/20" />

          {/* CCTV Position Dots */}
          {cctvs.map((cctv) => {
            const dot = getDotConfig(cctv);
            return (
              <motion.div
                key={cctv.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${cctv.position.x}%`,
                  top: `${cctv.position.y}%`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: cctvs.indexOf(cctv) * 0.03 }}
                onClick={() => onSelectCCTV?.(cctv.id)}
              >
                <motion.div
                  className="relative"
                  animate={
                    dot.glow
                      ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {/* Outer glow for emergency */}
                  {dot.glow && (
                    <div
                      className="absolute -inset-3 rounded-full blur-md"
                      style={{ backgroundColor: dot.color, opacity: 0.4 }}
                    />
                  )}

                  {/* Inner dot */}
                  <div
                    className={`
                      rounded-full border-2 border-black relative
                      ${cctv.status === 'EMERGENCY' ? 'emergency-pulse' : ''}
                      ${dot.size === 'lg' ? 'w-3.5 h-3.5' : dot.size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'}
                    `}
                    style={{
                      backgroundColor: dot.color,
                      boxShadow: `0 0 ${dot.glow ? '12px' : '6px'} ${dot.color}`,
                    }}
                  />

                  {/* Selection ring */}
                  {selectedCCTVId === cctv.id && (
                    <motion.div
                      className="absolute -inset-2.5 rounded-full border-2 border-cyan-400/70"
                      animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 0.4, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Label for alerts */}
                {(cctv.status === 'EMERGENCY' || cctv.status === 'HIGH_TRAFFIC') && (
                  <div className="absolute left-4 top-0 whitespace-nowrap">
                    <div className="px-2 py-0.5 rounded bg-black/80 border border-zinc-700 text-[10px] font-mono font-medium text-white">
                      {cctv.id}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Emergency Path Line */}
          {emergencyCCTVs.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <motion.path
                d={`M ${emergencyCCTVs[0].position.x} ${emergencyCCTVs[0].position.y}
                    Q 50 30 ${emergencyCCTVs[0].position.x} ${emergencyCCTVs[0].position.y + 20}`}
                stroke="#ef4444"
                strokeWidth="0.6"
                strokeDasharray="3,3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-500">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-xs text-zinc-500">High Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 emergency-pulse" />
            <span className="text-xs text-zinc-500">Emergency</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-800">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{cctvs.length}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-500">{highTrafficCCTVs.length}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Alerts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">{emergencyCCTVs.length}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Emergency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
