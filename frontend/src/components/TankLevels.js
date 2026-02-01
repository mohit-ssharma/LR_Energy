import React from 'react';
import { Droplet, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TankCard = ({ title, currentVolume, totalCapacity, unit, status, color }) => {
  const percentage = (currentVolume / totalCapacity) * 100;
  const available = totalCapacity - currentVolume;

  const getStatusConfig = (status) => {
    switch(status.toLowerCase()) {
      case 'normal': 
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-700', 
          border: 'border-emerald-200',
          icon: CheckCircle2,
          liquidColor: 'bg-emerald-500'
        };
      case 'moderate': 
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-700', 
          border: 'border-amber-200',
          icon: AlertTriangle,
          liquidColor: 'bg-amber-500'
        };
      case 'high': 
        return { 
          bg: 'bg-orange-50', 
          text: 'text-orange-700', 
          border: 'border-orange-200',
          icon: AlertTriangle,
          liquidColor: 'bg-orange-500'
        };
      case 'critical': 
        return { 
          bg: 'bg-rose-50', 
          text: 'text-rose-700', 
          border: 'border-rose-200',
          icon: AlertTriangle,
          liquidColor: 'bg-rose-500'
        };
      default: 
        return { 
          bg: 'bg-slate-50', 
          text: 'text-slate-700', 
          border: 'border-slate-200',
          icon: CheckCircle2,
          liquidColor: 'bg-slate-500'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`tank-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-violet-50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Droplet className={`w-4 h-4 ${color}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">08:43:41</span>
      </div>

      <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="text-4xl font-bold font-mono tracking-tighter text-slate-900" data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-volume`}>
                {currentVolume}
              </span>
              <span className="text-lg font-medium text-slate-400">{unit}</span>
            </div>
            <div className="text-sm font-medium text-slate-500">{percentage.toFixed(0)}% Full</div>
          </div>
          
          <div className="relative w-24 h-40 bg-slate-100 border-2 border-slate-300 rounded-lg overflow-hidden">
            <div 
              className={`absolute bottom-0 left-0 w-full ${statusConfig.liquidColor} opacity-80 transition-all duration-1000 ease-in-out`}
              style={{ height: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-30"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-between p-2 text-xs text-slate-500 font-mono">
              <div className="text-right">100%</div>
              <div className="text-right">75%</div>
              <div className="text-right">50%</div>
              <div className="text-right">25%</div>
              <div className="text-right">0%</div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xl font-bold font-mono text-white drop-shadow-lg">{percentage.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-cyan-50 rounded-md p-2 border border-cyan-100">
            <div className="text-xs text-slate-500 mb-0.5">Current</div>
            <div className="text-sm font-bold font-mono text-slate-900">{currentVolume}</div>
            <div className="text-xs text-slate-400">{unit}</div>
          </div>
          <div className="bg-slate-50 rounded-md p-2 border border-slate-100">
            <div className="text-xs text-slate-500 mb-0.5">Capacity</div>
            <div className="text-sm font-bold font-mono text-slate-900">{totalCapacity}</div>
            <div className="text-xs text-slate-400">{unit}</div>
          </div>
          <div className="bg-emerald-50 rounded-md p-2 border border-emerald-100">
            <div className="text-xs text-slate-500 mb-0.5">Available</div>
            <div className="text-sm font-bold font-mono text-slate-900">{available.toFixed(1)}</div>
            <div className="text-xs text-slate-400">{unit}</div>
          </div>
        </div>

        <div className={`flex items-center justify-center space-x-2 p-2 rounded-lg border ${statusConfig.border} ${statusConfig.bg}`}>
          <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
          <span className={`text-sm font-semibold ${statusConfig.text}`}>{status}</span>
        </div>
      </div>
    </div>
  );
};

const TankLevels = () => {
  const tanksData = [
    {
      title: 'Buffer Tank Slurry Level',
      currentVolume: 156.8,
      totalCapacity: 250,
      unit: 'm³',
      status: 'Moderate',
      color: 'text-cyan-600'
    },
    {
      title: 'Lagoon Tank Water Level',
      currentVolume: 342.5,
      totalCapacity: 500,
      unit: 'm³',
      status: 'Moderate',
      color: 'text-violet-600'
    }
  ];

  return (
    <div className="mb-6" data-testid="tank-levels-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Tank Level Monitoring</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tanksData.map((tank, index) => (
          <TankCard key={index} {...tank} />
        ))}
      </div>
    </div>
  );
};

export default TankLevels;
