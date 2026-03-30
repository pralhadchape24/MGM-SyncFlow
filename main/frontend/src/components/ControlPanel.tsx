import { motion } from 'framer-motion';
import { Volume2, Focus, AlertTriangle, Maximize, Settings, Zap } from 'lucide-react';

interface ControlPanelProps {
  aiEnabled: boolean;
  soundEnabled: boolean;
  onToggleAI: () => void;
  onToggleSound: () => void;
  onFocusCCTV: () => void;
  onTriggerEmergency: () => void;
  onViewFullscreen: () => void;
}

export default function ControlPanel({
  aiEnabled,
  soundEnabled,
  onToggleAI,
  onToggleSound,
  onFocusCCTV,
  onTriggerEmergency,
  onViewFullscreen,
}: ControlPanelProps) {
  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}
          >
            <Settings className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <h3 className="card-title">Control Panel</h3>
            <p className="card-subtitle">System commands</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* AI Detection Toggle */}
        <motion.button
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            aiEnabled
              ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/30'
              : 'bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onToggleAI}
        >
          <div
            className={`p-2 rounded-lg ${aiEnabled ? 'bg-cyan-500/20' : 'bg-zinc-700'}`}
          >
            <Zap className={`w-4 h-4 ${aiEnabled ? 'text-cyan-400' : 'text-zinc-500'}`} />
          </div>
          <div className="flex-1 text-left">
            <p
              className={`text-sm font-medium ${
                aiEnabled ? 'text-cyan-400' : 'text-zinc-400'
              }`}
            >
              AI Detection
            </p>
            <p className="text-xs text-zinc-500">
              {aiEnabled ? 'Actively monitoring' : 'Disabled'}
            </p>
          </div>
          <div
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
              aiEnabled ? 'bg-cyan-500' : 'bg-zinc-600'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: aiEnabled ? 22 : 4 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.button>

        {/* Sound Toggle */}
        <motion.button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 transition-all"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onToggleSound}
        >
          <div className="p-2 rounded-lg bg-zinc-700">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-zinc-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-zinc-600" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p
              className={`text-sm font-medium ${
                soundEnabled ? 'text-white' : 'text-zinc-500'
              }`}
            >
              Alert Sounds
            </p>
            <p className="text-xs text-zinc-500">
              {soundEnabled ? 'Audible alerts enabled' : 'Muted'}
            </p>
          </div>
          <div
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
              soundEnabled ? 'bg-green-500' : 'bg-zinc-600'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: soundEnabled ? 22 : 4 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.button>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <motion.button
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onFocusCCTV}
          >
            <Focus className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-zinc-300">Focus</span>
          </motion.button>

          <motion.button
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onTriggerEmergency}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Emergency</span>
          </motion.button>
        </div>

        {/* Fullscreen Button */}
        <motion.button
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onViewFullscreen}
        >
          <Maximize className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">View Fullscreen</span>
        </motion.button>

        {/* System Info */}
        <div className="pt-3 mt-1 space-y-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">System Uptime</span>
            <span className="text-green-500 font-mono">99.97%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Frame Rate</span>
            <span className="text-white font-mono">60 FPS</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">API Latency</span>
            <span className="text-cyan-400 font-mono">12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
