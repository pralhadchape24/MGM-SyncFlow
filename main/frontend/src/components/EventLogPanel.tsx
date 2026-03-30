import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { EventLog } from '../types/dashboard';
import { Clock, AlertTriangle, Activity, Zap } from 'lucide-react';

interface EventLogPanelProps {
  logs: EventLog[];
}

export default function EventLogPanel({ logs }: EventLogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (type: EventLog['type']) => {
    switch (type) {
      case 'EMERGENCY':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      case 'HIGH_TRAFFIC':
        return <Activity className="w-3.5 h-3.5 text-yellow-400" />;
      case 'PRIORITY':
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  const getLogStyles = (type: EventLog['type']) => {
    switch (type) {
      case 'EMERGENCY':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          textColor: 'text-red-400',
          iconBg: 'bg-red-500/20',
        };
      case 'HIGH_TRAFFIC':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          textColor: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20',
        };
      case 'PRIORITY':
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/20',
          textColor: 'text-cyan-400',
          iconBg: 'bg-cyan-500/20',
        };
      default:
        return {
          bg: 'bg-zinc-800/50',
          border: 'border-zinc-700/50',
          textColor: 'text-zinc-400',
          iconBg: 'bg-zinc-700/50',
        };
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="card flex flex-col" style={{ minHeight: '280px' }}>
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
          >
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="card-title">Event Log</h3>
            <p className="card-subtitle">Real-time activity feed</p>
          </div>
        </div>
        <div className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700">
          <span className="text-xs font-mono text-zinc-400">{logs.length} events</span>
        </div>
      </div>

      {/* Log Entries */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ maxHeight: '220px' }}
      >
        {logs.map((log, index) => {
          const styles = getLogStyles(log.type);
          return (
            <motion.div
              key={log.id}
              className={`flex items-start gap-3 p-2.5 rounded-lg ${styles.bg} border ${styles.border}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <div className={`p-1.5 rounded ${styles.iconBg}`}>
                {getLogIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-zinc-500">
                    [{formatTimestamp(log.timestamp)}]
                  </span>
                  <span className={`text-sm font-medium ${styles.textColor}`}>
                    {log.message}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <Clock className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No events yet</p>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 py-2 border-t border-zinc-800">
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-xs text-zinc-500">Monitoring active</span>
      </div>
    </div>
  );
}
