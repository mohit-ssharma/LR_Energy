import React from 'react';
import { Droplet, AlertTriangle } from 'lucide-react';

const TankCard = ({ title, currentVolume, totalCapacity, unit, status, color }) => {
  const percentage = (currentVolume / totalCapacity) * 100;
  const available = totalCapacity - currentVolume;

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-700 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300" data-testid={`tank-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Droplet className={`w-5 h-5 ${color}`} />
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        </div>
        <span className="text-xs text-gray-400">08:43:41</span>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-4xl font-bold text-gray-800" data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-volume`}>{currentVolume}</span>
          <span className="text-lg text-gray-600">{unit}</span>
        </div>
        <div className="text-sm text-gray-500">{percentage.toFixed(0)}% Full</div>
      </div>

      <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-4 border-2 border-gray-200">
        <div 
          className={`absolute bottom-0 w-full ${color.replace('text', 'bg')} opacity-20 transition-all duration-500`}
          style={{ height: `${percentage}%` }}
        ></div>
        <div 
          className={`absolute bottom-0 w-full ${color.replace('text', 'bg')} transition-all duration-500`}
          style={{ 
            height: `${percentage}%`,
            background: `linear-gradient(to top, ${color.includes('teal') ? '#14b8a6' : '#3b82f6'}, transparent)`
          }}
        >
          <div className="absolute top-2 left-0 right-0 text-center text-white text-sm font-bold drop-shadow-md">
            {percentage.toFixed(0)}%
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between p-2 text-xs text-gray-500">
          <div className="text-right">100%</div>
          <div className="text-right">75%</div>
          <div className="text-right">50%</div>
          <div className="text-right">25%</div>
          <div className="text-right">0%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="text-xs text-gray-600 mb-1">Current Volume</div>
          <div className="text-sm font-bold text-gray-800">{currentVolume} {unit}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Total Capacity</div>
          <div className="text-sm font-bold text-gray-800">{totalCapacity} {unit}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <div className="text-xs text-gray-600 mb-1">Available</div>
          <div className="text-sm font-bold text-gray-800">{available.toFixed(1)} {unit}</div>
        </div>
      </div>

      <div className={`flex items-center justify-center space-x-2 p-2 rounded-lg border ${getStatusColor(status)}`}>
        {status.toLowerCase() !== 'normal' && <AlertTriangle className="w-4 h-4" />}
        <span className="text-sm font-semibold">{status}</span>
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
      color: 'text-teal-600'
    },
    {
      title: 'Lagoon Tank Water Level',
      currentVolume: 342.5,
      totalCapacity: 500,
      unit: 'm³',
      status: 'Moderate',
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="mb-8" data-testid="tank-levels-section">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Tank Level Monitoring</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tanksData.map((tank, index) => (
          <TankCard key={index} {...tank} />
        ))}
      </div>
    </div>
  );
};

export default TankLevels;
