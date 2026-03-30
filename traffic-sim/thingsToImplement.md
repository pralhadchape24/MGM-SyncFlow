  ---                                                                                                                        Animation & UX Flaw Analysis                                                                                             
                                                                                                                             CRITICAL FLAWS (Functional)                                                                                              

  ┌─────┬────────────────────────┬─────────────────────────┬───────────────────────────────────────────────────────────┐
  │  #  │          Flaw          │        Location         │                          Impact                           │   
  ├─────┼────────────────────────┼─────────────────────────┼───────────────────────────────────────────────────────────┤   
  │ 1   │ Cars ignore traffic    │ Car component (lines    │ No stop-at-red behavior; signals are purely decorative    │   
  │     │ signals                │ 108-195)                │                                                           │   
  ├─────┼────────────────────────┼─────────────────────────┼───────────────────────────────────────────────────────────┤   
  │ 2   │ No collision detection │ Car component           │ 80 cars pass through each other — unrealistic and jarring │   
  ├─────┼────────────────────────┼─────────────────────────┼───────────────────────────────────────────────────────────┤   
  │ 3   │ Instant direction      │ Lines 161-168           │ Cars snap to new axis/center instantly — zero turn        │   
  │     │ changes                │                         │ animation                                                 │   
  ├─────┼────────────────────────┼─────────────────────────┼───────────────────────────────────────────────────────────┤   
  │ 4   │ Random lateral jitter  │ Line 167                │ Math.random() every intersection causes jerky,            │   
  │     │                        │                         │ unpredictable lane changes                                │   
  └─────┴────────────────────────┴─────────────────────────┴───────────────────────────────────────────────────────────┘   

  PHYSICS/MOTION FLAWS

  ┌─────┬─────────────────────────────────────┬────────────────────┬──────────────────────────────────────────────────┐    
  │  #  │                Flaw                 │      Location      │                      Impact                      │    
  ├─────┼─────────────────────────────────────┼────────────────────┼──────────────────────────────────────────────────┤    
  │ 5   │ No acceleration/deceleration        │ Line 138           │ Constant speed, no easing in/out                 │    
  ├─────┼─────────────────────────────────────┼────────────────────┼──────────────────────────────────────────────────┤    
  │ 6   │ Instant rotation                    │ Lines 182-185      │ mesh.rotation.y snaps immediately to target      │    
  ├─────┼─────────────────────────────────────┼────────────────────┼──────────────────────────────────────────────────┤    
  │ 7   │ No smooth interpolation (lerp)      │ Entire Car         │ Position updates are discrete jumps, not fluid   │    
  │     │                                     │ component          │ motion                                           │    
  ├─────┼─────────────────────────────────────┼────────────────────┼──────────────────────────────────────────────────┤    
  │ 8   │ No speed variation near             │ Lines 143-153      │ Cars don't slow down approaching turns           │    
  │     │ intersections                       │                    │                                                  │    
  └─────┴─────────────────────────────────────┴────────────────────┴──────────────────────────────────────────────────┘    

  CAMERA/CONTROLS FLAWS

  ┌─────┬──────────────────────────────────┬──────────────┬────────────────────────────────────────────────────────────┐   
  │  #  │               Flaw               │   Location   │                           Impact                           │   
  ├─────┼──────────────────────────────────┼──────────────┼────────────────────────────────────────────────────────────┤   
  │ 9   │ OrbitControls damping not        │ Line 559     │ enableDamping set but no dampingFactor — feels             │   
  │     │ configured                       │              │ loose/uncontrolled                                         │   
  ├─────┼──────────────────────────────────┼──────────────┼────────────────────────────────────────────────────────────┤   
  │ 10  │ No auto-rotate or scene overview │ Lines        │ Static camera unless user drags; no cinematic option       │   
  │     │                                  │ 557-563      │                                                            │   
  ├─────┼──────────────────────────────────┼──────────────┼────────────────────────────────────────────────────────────┤   
  │ 11  │ No camera distance bounds        │ Lines        │ Jerky stop at minDistance={60} / maxDistance={700}         │   
  │     │ animation                        │ 560-561      │                                                            │   
  └─────┴──────────────────────────────────┴──────────────┴────────────────────────────────────────────────────────────┘   

  VISUAL/QUALITY FLAWS

  ┌─────┬───────────────────────────┬──────────────────────────┬──────────────────────────────────────────────────────┐    
  │  #  │           Flaw            │         Location         │                        Impact                        │    
  ├─────┼───────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────┤    
  │ 12  │ Unsafe material type      │ Lines 342-344            │ as unknown as { emissiveIntensity: number } —        │    
  │     │ casting                   │                          │ runtime crash risk                                   │    
  ├─────┼───────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────┤    
  │ 13  │ Shadow quality not        │ Line 555                 │ castShadow enabled but no shadow map tuning — ugly   │    
  │     │ configured                │                          │ shadows                                              │    
  ├─────┼───────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────┤    
  │ 14  │ No post-processing        │ Entire Canvas            │ Missing bloom, ambient occlusion, anti-aliasing —    │    
  │     │                           │                          │ looks flat                                           │    
  ├─────┼───────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────┤    
  │ 15  │ Z-fighting risk           │ Ground at y=0, roads at  │ Potential flickering at ground/road intersection     │    
  │     │                           │ y=0.01                   │                                                      │    
  ├─────┼───────────────────────────┼──────────────────────────┼──────────────────────────────────────────────────────┤    
  │ 16  │ No anti-aliasing          │ Canvas (line 551)        │ Jagged edges on 3D geometry                          │    
  └─────┴───────────────────────────┴──────────────────────────┴──────────────────────────────────────────────────────┘    

  PERFORMANCE FLAWS

  ┌─────┬────────────────────────────────┬───────────────────────────┬────────────────────────────────────────────────┐    
  │  #  │              Flaw              │         Location          │                     Impact                     │    
  ├─────┼────────────────────────────────┼───────────────────────────┼────────────────────────────────────────────────┤    
  │ 17  │ No object pooling              │ Lines 599-601             │ 80 <Car> components mounted forever, no        │    
  │     │                                │                           │ recycling                                      │    
  ├─────┼────────────────────────────────┼───────────────────────────┼────────────────────────────────────────────────┤    
  │ 18  │ No LOD (Level of Detail)       │ Car mesh always full      │ GPU waste at long distances                    │    
  │     │                                │ detail                    │                                                │    
  ├─────┼────────────────────────────────┼───────────────────────────┼────────────────────────────────────────────────┤    
  │ 19  │ No frustum culling             │ All meshes                │ Potential over-rendering                       │    
  │     │ customization                  │                           │                                                │    
  ├─────┼────────────────────────────────┼───────────────────────────┼────────────────────────────────────────────────┤    
  │ 20  │ No FPS display/metrics         │ Entire app                │ User has zero visibility into performance      │    
  └─────┴────────────────────────────────┴───────────────────────────┴────────────────────────────────────────────────┘    

  CODE QUALITY FLAWS

  ┌─────┬────────────────────────────────┬────────────────┬────────────────────────────────────────────────────────────┐   
  │  #  │              Flaw              │    Location    │                           Impact                           │   
  ├─────┼────────────────────────────────┼────────────────┼────────────────────────────────────────────────────────────┤   
  │ 21  │ StrictMode double-invokes      │ main.tsx line  │ Car seeds may get duplicated/destabilized in dev           │   
  │     │                                │ 7              │                                                            │   
  ├─────┼────────────────────────────────┼────────────────┼────────────────────────────────────────────────────────────┤   
  │ 22  │ Traffic signal inefficient     │ Lines 347-353  │ Sets all 3 emissive intensities every frame, even          │   
  │     │ update                         │                │ unchanged ones                                             │   
  ├─────┼────────────────────────────────┼────────────────┼────────────────────────────────────────────────────────────┤   
  │ 23  │ No timestamp interpolation     │ useFrame usage │ dt is raw delta but not used for smooth interpolation      │   
  └─────┴────────────────────────────────┴────────────────┴────────────────────────────────────────────────────────────┘   

  ---
  Top Improvements for BEST Animation & UX

  Tier 1 — High Impact (Fix These First)

  1. Add smooth lerped motion — Replace instant position updates with THREE.MathUtils.lerp() for fluid car movement        
  2. Implement car-to-car collision avoidance — Simple distance checks + velocity adjustment
  3. Add traffic signal awareness — Cars check signal phase, slow down/stop at red
  4. Smooth turning animation — Use a tween/interpolation over 0.3-0.5s when changing direction
  5. Configure OrbitControls damping — Add dampingFactor={0.05} and enableSmoothing

  Tier 2 — Medium Impact

  6. Add acceleration curves — Ease into turns, decelerate approaching intersections
  7. Enable anti-aliasing — Use gl={{ antialias: true }} on Canvas
  8. Configure shadow maps — Tune shadowMap type and shadowCamera frustum
  9. Add subtle bloom to traffic lights — drei's EffectComposer with Bloom
  10. Fix z-fighting — Separate ground/road Y values more, or use depthTest

  Tier 3 — Polish

  11. Add auto-rotate camera option — autoRotate, autoRotateSpeed on OrbitControls
  12. FPS counter — Debug layer for performance awareness
  13. Smooth rotation transitions — Lerp rotation over multiple frames
  14. Add ambient occlusion — SSAO post-processing for depth
  15. Implement object pooling — Recycle cars that leave the map bounds