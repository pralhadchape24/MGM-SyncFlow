import { motion } from 'framer-motion';
import type { CCTV } from '../types/dashboard';
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';

interface PriorityAlertProps {
  cctvs: CCTV[];
  onViewDetails?: () => void;
}

export default function PriorityAlert({ cctvs, onViewDetails }: PriorityAlertProps) {
  if (cctvs.length === 0) return null;

  return (
    <motion.div
      className="mx-6 my-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left - Alert Info */}
        <div className="flex items-center gap-4">
          {/* Emergency Icon */}
          <motion.div
            className="flex items-center gap-2"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-400 uppercase tracking-wide">
                Emergency Detected
              </p>
              <p className="text-xs text-zinc-500">
                {cctvs.length} camera{cctvs.length > 1 ? 's' : ''} requiring immediate attention
              </p>
            </div>
          </motion.div>

          {/* Separator */}
          <div className="h-10 w-px bg-red-500/20" />

          {/* Camera IDs */}
          <div className="flex items-center gap-2">
            {cctvs.slice(0, 3).map((cctv, index) => (
              <motion.div
                key={cctv.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-700"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-white font-mono font-semibold text-sm">{cctv.id}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-red-400 text-xs font-medium">
                  {Math.round(cctv.confidence * 100)}%
                </span>
              </motion.div>
            ))}

            {cctvs.length > 3 && (
              <span className="text-zinc-500 text-xs">
                +{cctvs.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Right - Time & Action */}
        <div className="flex items-center gap-4">
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>

          {/* Action Button */}
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewDetails}
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
