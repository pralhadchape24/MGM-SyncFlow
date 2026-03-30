import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CCTV } from '../types/dashboard';
import { MapPin, Clock, Activity, AlertTriangle } from 'lucide-react';

interface CCTVPanelProps {
  cctv: CCTV;
  isPriority?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function CCTVPanel({ cctv, isPriority, isSelected, onSelect }: CCTVPanelProps) {
  const statusConfig = useMemo(() => {
    switch (cctv.status) {
      case 'EMERGENCY':
        return {
          bgGradient: 'from-red-500/15 to-red-500/5',
          borderColor: 'rgba(239, 68, 68, 0.5)',
          badgeClass: 'badge-emergency',
          iconColor: '#ef4444',
          label: 'Emergency',
        };
      case 'HIGH_TRAFFIC':
        return {
          bgGradient: 'from-yellow-500/15 to-yellow-500/5',
          borderColor: 'rgba(234, 179, 8, 0.4)',
          badgeClass: 'badge-warning',
          iconColor: '#eab308',
          label: 'High Traffic',
        };
      default:
        return {
          bgGradient: 'from-zinc-800/50 to-transparent',
          borderColor: 'rgba(63, 63, 70, 0.5)',
          badgeClass: 'badge-normal',
          iconColor: '#22c55e',
          label: 'Normal',
        };
    }
  }, [cctv.status]);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && onSelect) {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        bg-gradient-to-br ${statusConfig.bgGradient}
        border-2 transition-all duration-300
        ${cctv.status === 'EMERGENCY' ? 'emergency-pulse' : ''}
        ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-zinc-950' : ''}
        ${isPriority ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-zinc-950' : ''}
      `}
      style={{
        borderColor: isSelected || isPriority ? undefined : statusConfig.borderColor,
      }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Priority Corner Indicator */}
      {isPriority && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-t-red-500 border-l-[28px] border-l-transparent z-10" />
      )}

      {/* Video Feed Area */}
      <div className="relative aspect-video bg-zinc-900 scanlines">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Status Visualization */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {cctv.status === 'EMERGENCY' ? (
            <motion.div
              className="flex flex-col items-center gap-3"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">
                Emergency
              </span>
            </motion.div>
          ) : cctv.status === 'HIGH_TRAFFIC' ? (
            <motion.div
              className="flex flex-col items-center gap-3 opacity-70"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}
              >
                <Activity className="w-8 h-8 text-yellow-500" />
              </div>
              <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">
                High Traffic
              </span>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-25">
              <svg
                className="w-14 h-14 text-zinc-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Live Feed
              </span>
            </div>
          )}
        </div>

        {/* Moving Dots for Normal Status */}
        {cctv.status === 'NORMAL' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
                initial={{ x: `${20 + i * 30}%`, y: `${30 + i * 20}%` }}
                animate={{
                  x: [`${20 + i * 30}%`, `${60 + i * 10}%`, `${20 + i * 30}%`],
                  y: [`${30 + i * 20}%`, `${50 + i * 15}%`, `${30 + i * 20}%`],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>
        )}

        {/* Traffic Dots for High Traffic */}
        {cctv.status === 'HIGH_TRAFFIC' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400/40"
                initial={{ x: `${10 + i * 15}%`, y: `${20 + (i % 3) * 25}%` }}
                animate={{
                  x: [`${10 + i * 15}%`, `${70 + (i % 3) * 10}%`, `${10 + i * 15}%`],
                }}
                transition={{
                  duration: 2 + i * 0.4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>
        )}

        {/* Emergency Visualization */}
        {cctv.status === 'EMERGENCY' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0 bg-red-500/10"
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-red-500"
                initial={{ x: `${15 + i * 20}%`, y: `${25 + (i % 3) * 20}%` }}
                animate={{
                  x: [`${15 + i * 20}%`, `${80}%`, `${15 + i * 20}%`],
                  opacity: [1, 0.4, 1],
                }}
                transition={{
                  duration: 1.2 + i * 0.2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>
        )}

        {/* Top Overlay - Camera ID & Status */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm border border-white/10">
            <span className="text-sm font-mono font-semibold text-white">{cctv.id}</span>
          </div>
          {cctv.status !== 'NORMAL' && (
            <div className={`badge ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </div>
          )}
        </div>

        {/* Top Right - Confidence Badge */}
        {cctv.hasAmbulance && (
          <div className="absolute top-3 right-3">
            <div className="px-2.5 py-1 rounded-md bg-red-500/90 backdrop-blur-sm">
              <span className="text-xs font-bold text-white">
                {Math.round(cctv.confidence * 100)}% CONF
              </span>
            </div>
          </div>
        )}

        {/* Bottom Overlay - Status Indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusConfig.iconColor }}
            animate={
              cctv.status === 'EMERGENCY'
                ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
                : {}
            }
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-white/70">
            {cctv.status === 'NORMAL' ? 'REC' : cctv.status === 'HIGH_TRAFFIC' ? 'ALERT' : 'EMERGENCY'}
          </span>
        </div>

        {/* Bottom Left - Ambulance Indicator */}
        {cctv.hasAmbulance && (
          <motion.div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/90 backdrop-blur-sm"
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
            <span className="text-[10px] font-bold text-white uppercase">Ambulance</span>
          </motion.div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 bg-zinc-900/80">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white truncate">{cctv.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
              <span className="text-xs text-zinc-500 truncate">{cctv.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Clock className="w-3 h-3 text-zinc-600" />
            <span className="text-[11px] font-mono text-zinc-600">
              {cctv.timestamp
                ? cctv.timestamp.toLocaleTimeString('en-US', { hour12: false })
                : '--:--:--'}
            </span>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
          {cctv.status === 'NORMAL' && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">Operational</span>
            </div>
          )}
          {cctv.status === 'HIGH_TRAFFIC' && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-500">Heavy Traffic</span>
            </div>
          )}
          {cctv.status === 'EMERGENCY' && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-500">Critical</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
