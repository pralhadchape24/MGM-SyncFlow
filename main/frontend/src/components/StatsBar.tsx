import { motion } from 'framer-motion';
import type { DashboardStats } from '../types/dashboard';
import { Shield, CheckCircle, AlertTriangle, Siren } from 'lucide-react';

interface StatsBarProps {
  stats: DashboardStats;
  lastUpdate: Date;
}

export default function StatsBar({ stats, lastUpdate }: StatsBarProps) {
  const statItems = [
    {
      label: 'Total Cameras',
      value: stats.totalCCTVs,
      sublabel: 'active',
      icon: Shield,
      color: '#22d3ee',
    },
    {
      label: 'Normal',
      value: stats.normalCount,
      sublabel: 'operational',
      icon: CheckCircle,
      color: '#22c55e',
    },
    {
      label: 'High Traffic',
      value: stats.highTrafficCount,
      sublabel: 'needs attention',
      icon: AlertTriangle,
      color: '#eab308',
    },
    {
      label: 'Emergency',
      value: stats.emergencyCount,
      sublabel: 'critical',
      icon: Siren,
      color: '#ef4444',
      highlight: stats.emergencyCount > 0,
    },
  ];

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800">
      {/* Stats Row */}
      <div className="flex items-center gap-6">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {/* Icon Container */}
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${item.color}15`,
                border: `1px solid ${item.color}30`,
              }}
            >
              <item.icon
                className="w-5 h-5"
                style={{ color: item.color }}
              />
            </div>

            {/* Text Content */}
            <div>
              <motion.p
                className="text-2xl font-bold"
                style={{ color: item.color }}
                animate={item.highlight ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {item.value}
              </motion.p>
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium text-zinc-400">{item.label}</p>
                <span className="text-zinc-600">·</span>
                <p className="text-xs text-zinc-500">{item.sublabel}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right Side - Priority Mode & Last Update */}
      <div className="flex items-center gap-4">
        {/* Priority Mode Indicator */}
        {stats.priorityFeedsActive && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">
              Priority Mode
            </span>
          </motion.div>
        )}

        {/* Last Update */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Last sync:</span>
          <span className="font-mono text-zinc-400">
            {lastUpdate.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>
    </div>
  );
}
