import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  Volume2,
  VolumeX,
  RefreshCw,
  Wifi,
  Battery,
} from 'lucide-react';
import type { CCTV, EventLog, DashboardStats, CCTVStatus } from '../types/dashboard';
import { mockCCTVs, mockEventLogs, getDashboardStats } from '../data/mockData';
import CCTVPanel from './CCTVPanel';
import MiniMap from './MiniMap';
import EventLogPanel from './EventLogPanel';
import ControlPanel from './ControlPanel';
import StatsBar from './StatsBar';
import PriorityAlert from './PriorityAlert';

export default function Dashboard() {
  const [cctvs, setCCTVs] = useState<CCTV[]>(mockCCTVs);
  const [eventLogs, setEventLogs] = useState<EventLog[]>(mockEventLogs);
  const [stats, setStats] = useState<DashboardStats>(getDashboardStats(mockCCTVs));
  const [aiEnabled, setAiEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedCCTVId, setSelectedCCTVId] = useState<string | null>(null);

  const playEmergencyTone = () => {
    if (!soundEnabled) return;

    try {
      const audioContext = new window.AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'square';
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.05;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.12);
      oscillator.onended = () => {
        void audioContext.close();
      };
    } catch {
      // Ignore audio failures
    }
  };

  const addEventLog = (type: EventLog['type'], message: string, cctvId = 'ALL') => {
    const newLog: EventLog = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      cctvId,
      message,
      type,
    };

    setEventLogs(prev => [...prev.slice(-99), newLog]);

    if (type === 'EMERGENCY' || type === 'PRIORITY') {
      playEmergencyTone();
    }
  };

  const classifyLogType = (status: CCTVStatus): EventLog['type'] => {
    if (status === 'EMERGENCY') return 'EMERGENCY';
    if (status === 'HIGH_TRAFFIC') return 'HIGH_TRAFFIC';
    return 'NORMAL';
  };

  const mutateRandomCCTV = () => {
    setCCTVs(prevCCTVs => {
      const updated = [...prevCCTVs];
      const randomIndex = Math.floor(Math.random() * updated.length);
      const randomCCTV = updated[randomIndex];

      if (!randomCCTV) return prevCCTVs;

      const roll = Math.random();
      const nextStatus: CCTVStatus =
        roll > 0.88 ? 'EMERGENCY' : roll > 0.6 ? 'HIGH_TRAFFIC' : 'NORMAL';

      if (nextStatus === randomCCTV.status) return prevCCTVs;

      const updatedCamera: CCTV = {
        ...randomCCTV,
        status: nextStatus,
        hasAmbulance: nextStatus === 'EMERGENCY',
        confidence: nextStatus === 'NORMAL' ? 0 : Number((0.65 + Math.random() * 0.34).toFixed(2)),
        timestamp: new Date(),
      };

      updated[randomIndex] = updatedCamera;

      addEventLog(
        classifyLogType(nextStatus),
        `CCTV ${updatedCamera.id} → ${nextStatus.replace('_', ' ')}`,
        updatedCamera.id,
      );

      setSelectedCCTVId(updatedCamera.id);

      return updated;
    });
  };

  const handleToggleAI = () => {
    const next = !aiEnabled;
    setAiEnabled(next);
    addEventLog('PRIORITY', `AI Detection ${next ? 'enabled' : 'disabled'}`);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    addEventLog('NORMAL', `Alert sounds ${next ? 'enabled' : 'muted'}`);
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    addEventLog('NORMAL', 'Manual refresh triggered');
    if (aiEnabled) {
      mutateRandomCCTV();
    }
  };

  const handleFocusCCTV = () => {
    const target =
      cctvs.find(c => c.status === 'EMERGENCY') ??
      cctvs.find(c => c.status === 'HIGH_TRAFFIC') ??
      cctvs[0];

    if (!target) return;

    setSelectedCCTVId(target.id);
    addEventLog('PRIORITY', `Focusing camera ${target.id}`, target.id);
  };

  const handleTriggerEmergency = () => {
    setCCTVs(prev => {
      const candidates = prev.filter(c => c.status !== 'EMERGENCY');
      if (candidates.length === 0) return prev;

      const randomTarget = candidates[Math.floor(Math.random() * candidates.length)];
      if (!randomTarget) return prev;

      const updated = prev.map(c =>
        c.id === randomTarget.id
          ? { ...c, status: 'EMERGENCY', hasAmbulance: true, confidence: 0.99, timestamp: new Date() }
          : c,
      );

      setSelectedCCTVId(randomTarget.id);
      addEventLog('EMERGENCY', `Emergency flagged on ${randomTarget.id}`, randomTarget.id);

      return updated;
    });
  };

  const handleViewFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        addEventLog('NORMAL', 'Entered fullscreen mode');
      } catch {
        addEventLog('NORMAL', 'Fullscreen request blocked');
      }
      return;
    }

    await document.exitFullscreen();
    addEventLog('NORMAL', 'Exited fullscreen mode');
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());

      if (aiEnabled) {
        mutateRandomCCTV();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [aiEnabled]);

  // Update stats when CCTVs change
  useEffect(() => {
    setStats(getDashboardStats(cctvs));
  }, [cctvs]);

  const emergencyCCTVs = cctvs.filter(c => c.status === 'EMERGENCY');
  const hasPriorityFeed = emergencyCCTVs.length > 0;

  // Sort CCTVs: emergency first, then high traffic, then normal
  const sortedCCTVs = [...cctvs].sort((a, b) => {
    if (a.status === 'EMERGENCY' && b.status !== 'EMERGENCY') return -1;
    if (b.status === 'EMERGENCY' && a.status !== 'EMERGENCY') return 1;
    if (a.status === 'HIGH_TRAFFIC' && b.status === 'NORMAL') return -1;
    if (b.status === 'HIGH_TRAFFIC' && a.status === 'NORMAL') return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Branding */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">City Surveillance Hub</h1>
              <p className="text-xs text-zinc-500">AI-Powered Monitoring System</p>
            </div>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-4">
            {/* System Status Pills */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-zinc-400">System Online</span>
              </div>
              <div className="w-px h-4 bg-zinc-700" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-400">12ms</span>
              </div>
              <div className="w-px h-4 bg-zinc-700" />
              <div className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-green-500">98%</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-zinc-700" />

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleAI}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  aiEnabled
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
              >
                <Zap className={`w-4 h-4 ${aiEnabled ? 'animate-pulse' : ''}`} />
                AI {aiEnabled ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={handleToggleSound}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-all"
                title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-zinc-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-600" />
                )}
              </button>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <StatsBar stats={stats} lastUpdate={lastUpdate} />
      </header>

      {/* Priority Alert Banner */}
      <AnimatePresence>
        {hasPriorityFeed && (
          <PriorityAlert cctvs={emergencyCCTVs} onViewDetails={handleFocusCCTV} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* CCTV Grid Area */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Camera Feeds</h2>
              <p className="text-sm text-zinc-500">Monitoring {cctvs.length} cameras across the city</p>
            </div>
            {hasPriorityFeed && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <motion.div
                  className="w-2 h-2 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-sm font-medium text-red-400">Priority Feed Active</span>
              </div>
            )}
          </div>

          {/* CCTV Grid */}
          <div className="flex-1 overflow-auto">
            <div
              className={`grid gap-4 ${
                hasPriorityFeed
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {sortedCCTVs.map((cctv, index) => (
                  <motion.div
                    key={cctv.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: hasPriorityFeed && cctv.status !== 'EMERGENCY' ? 0.6 : 1,
                      scale: 1,
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <CCTVPanel
                      cctv={cctv}
                      isPriority={hasPriorityFeed && cctv.status === 'EMERGENCY'}
                      isSelected={selectedCCTVId === cctv.id}
                      onSelect={() => {
                        setSelectedCCTVId(cctv.id);
                        addEventLog('PRIORITY', `Selected camera ${cctv.id}`, cctv.id);
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-zinc-900/50 border-l border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
            {/* Mini Map */}
            <MiniMap
              cctvs={cctvs}
              selectedCCTVId={selectedCCTVId}
              onSelectCCTV={(id) => {
                setSelectedCCTVId(id);
                addEventLog('PRIORITY', `Map focus on camera ${id}`, id);
              }}
            />

            {/* Event Log */}
            <EventLogPanel logs={eventLogs} />

            {/* Control Panel */}
            <ControlPanel
              aiEnabled={aiEnabled}
              soundEnabled={soundEnabled}
              onToggleAI={handleToggleAI}
              onToggleSound={handleToggleSound}
              onFocusCCTV={handleFocusCCTV}
              onTriggerEmergency={handleTriggerEmergency}
              onViewFullscreen={() => {
                void handleViewFullscreen();
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
