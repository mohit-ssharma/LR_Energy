import React from 'react';
import { Droplets, Database, AlertTriangle } from 'lucide-react';

const TankLevels = () => {
  // Updated dummy data per requirements - Both tanks with same capacity and validation rules
  const tanks = [
    {
      id: 'buffer',
      name: 'Buffer Tank Slurry Level',
      capacity: 1078,
      capacityUnit: 'm³',
      currentLevel: 82,
      volume: 884,
      volumeUnit: 'm³',
      status: 'Warning',
      color: 'amber',
      icon: Database
    },
    {
      id: 'lagoon',
      name: 'Lagoon Tank Water Level',
      capacity: 1078,
      capacityUnit: 'm³',
      currentLevel: 76,
      volume: 819,
      volumeUnit: 'm³',
      status: 'Warning',
      color: 'amber',
      icon: Droplets
    }
  ];

  // Status logic: <70% = Normal, 70-90% = Warning, >90% = Critical
  const getStatus = (level) => {
    if (level < 70) return { status: 'Normal', color: 'emerald' };
    if (level <= 90) return { status: 'Warning', color: 'amber' };
    return { status: 'Critical', color: 'rose' };
  };

  const TankVisualization = ({ tank }) => {
    // Apply validation rule: <70% = Normal, 70-90% = Warning, >90% = Critical
    const statusInfo = getStatus(tank.currentLevel);
    
    const gradientColors = {
      emerald: { from: '#10b981', to: '#059669' },
      cyan: { from: '#06b6d4', to: '#0891b2' },
      amber: { from: '#f59e0b', to: '#d97706' },
      rose: { from: '#f43f5e', to: '#e11d48' }
    };

    const statusStyles = {
      Normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Warning: 'bg-amber-100 text-amber-700 border-amber-200',
      Critical: 'bg-rose-100 text-rose-700 border-rose-200'
    };

    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`tank-${tank.id}`}>
        <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-teal-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${statusInfo.status === 'Warning' ? 'bg-amber-500' : statusInfo.status === 'Critical' ? 'bg-rose-500' : 'bg-cyan-600'} rounded-md`}>
              <tank.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{tank.name}</h3>
              <span className="text-xs text-slate-500">Capacity: {tank.capacity.toLocaleString()} {tank.capacityUnit}</span>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${statusStyles[statusInfo.status]}`}>
            {(statusInfo.status === 'Warning' || statusInfo.status === 'Critical') && <AlertTriangle className="w-3 h-3 inline mr-1" />}
            {statusInfo.status}
          </span>
        </div>

        <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
          <div className="flex items-center justify-between">
            {/* Tank visualization */}
            <div className="relative w-32 h-48 bg-slate-100 border-4 border-slate-300 rounded-xl overflow-hidden">
              {/* Water/liquid fill */}
              <div 
                className="absolute bottom-0 left-0 w-full transition-all duration-1000"
                style={{ 
                  height: `${tank.currentLevel}%`,
                  background: `linear-gradient(to top, ${gradientColors[statusInfo.color].from}, ${gradientColors[statusInfo.color].to})`
                }}
              >
                {/* Animated wave effect */}
                <div className="absolute top-0 left-0 w-full h-2">
                  <svg viewBox="0 0 100 10" className="w-full h-full opacity-50">
                    <path 
                      d="M0 5 Q 25 0, 50 5 T 100 5 V 10 H 0 Z" 
                      fill="white"
                      className="animate-pulse-subtle"
                    />
                  </svg>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-20"></div>
              </div>
              
              {/* Level markers */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
                <div className="text-xs text-slate-400 font-mono">100%</div>
                <div className="text-xs text-slate-400 font-mono">50%</div>
                <div className="text-xs text-slate-400 font-mono">0%</div>
              </div>

              {/* Center display */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-lg px-3 py-2 shadow-lg">
                <div className="text-2xl font-bold font-mono text-slate-900">{tank.currentLevel}%</div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 ml-6 space-y-3">
              <div className="bg-gradient-to-r from-slate-50 to-white rounded-lg p-4 border border-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Current Level</div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold font-mono text-slate-900" data-testid={`${tank.id}-level`}>{tank.currentLevel}</span>
                  <span className="text-lg font-medium text-slate-500">%</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-white rounded-lg p-4 border border-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Volume</div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold font-mono text-slate-900" data-testid={`${tank.id}-volume`}>{tank.volume.toLocaleString()}</span>
                  <span className="text-sm font-medium text-slate-500">{tank.volumeUnit}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-white rounded-lg p-4 border border-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Capacity</div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold font-mono text-slate-900">{tank.capacity.toLocaleString()}</span>
                  <span className="text-sm font-medium text-slate-500">{tank.capacityUnit}</span>
                </div>
              </div>

              <div className="flex items-center text-xs text-slate-400 font-mono">
                <span>Last Updated: 08:43:41</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6" data-testid="tank-levels-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Tank Level Monitoring</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tanks.map(tank => (
          <TankVisualization key={tank.id} tank={tank} />
        ))}
      </div>
    </div>
  );
};

export default TankLevels;
