import React from 'react';
import { Thermometer, Gauge, Layers, Activity } from 'lucide-react';

const Digester = ({ unit, data }) => {
  const MetricCard = ({ label, value, unit, min, max, color, testId }) => {
    const percentage = max ? ((parseFloat(value) - min) / (max - min)) * 100 : 0;
    
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">{label}</div>
        <div className="flex items-baseline space-x-1 mb-2">
          <span className="text-2xl font-bold font-mono text-slate-900" data-testid={testId}>{value}</span>
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        </div>
        {min !== undefined && max !== undefined && (
          <>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{min}{unit}</span>
              <span>Max {max}{unit}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${color} transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </>
        )}
        <div className="text-xs text-slate-400 mt-2 font-mono">08:43:41</div>
      </div>
    );
  };

  // Slurry Height Tank Visualization (matching Buffer Tank design)
  const SlurryTank = ({ value, status }) => {
    const maxHeight = 10; // meters
    const percentage = (parseFloat(value) / maxHeight) * 100;
    
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Slurry Height</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1 mb-1">
              <span className="text-2xl font-bold font-mono text-slate-900">{value}</span>
              <span className="text-sm font-medium text-slate-500">m</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              status === 'Operational' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              {status}
            </span>
          </div>
          <div className="relative w-16 h-24 bg-slate-100 border-2 border-slate-300 rounded-lg overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 w-full bg-cyan-500 opacity-80 transition-all duration-1000"
              style={{ height: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-30"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-sm font-bold font-mono text-white drop-shadow-lg">{percentage.toFixed(0)}%</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-2 font-mono">08:43:41</div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`digester-${unit}-section`}>
      <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-violet-700 rounded-md">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800">Digester {unit}</h3>
            <span className="text-xs text-slate-600">Unit {unit} - Active</span>
          </div>
        </div>
        <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 font-semibold">
          Operational
        </span>
      </div>

      <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Temperature Section */}
          <div className="bg-gradient-to-br from-orange-50/50 to-red-50/30 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center space-x-2 mb-3">
              <Thermometer className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Temperature</h4>
            </div>
            
            <MetricCard
              label="Temperature"
              value={data.temperature}
              unit="°C"
              min={30}
              max={40}
              color="bg-gradient-to-r from-orange-400 to-red-500"
              testId={`digester-${unit}-temp`}
            />
          </div>

          {/* Pressure Section */}
          <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/30 rounded-lg p-4 border border-cyan-100">
            <div className="flex items-center space-x-2 mb-3">
              <Gauge className="w-4 h-4 text-cyan-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Pressure</h4>
            </div>
            
            <div className="space-y-3">
              <MetricCard
                label="Balloon Gas Pressure"
                value={data.pressure.balloonGas}
                unit=""
                min={0}
                max={40}
                color="bg-gradient-to-r from-cyan-400 to-blue-500"
                testId={`digester-${unit}-gas-pressure`}
              />

              <MetricCard
                label="Balloon Air Pressure"
                value={data.pressure.balloonAir}
                unit=""
                min={0}
                max={25}
                color="bg-gradient-to-r from-cyan-400 to-blue-500"
                testId={`digester-${unit}-air-pressure`}
              />
            </div>
          </div>

          {/* Slurry Height Section */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Levels</h4>
            </div>
            
            <SlurryTank 
              value={data.slurryHeight} 
              status="Operational"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DigestersSection = () => {
  // Updated dummy data per requirements
  const digester1Data = {
    temperature: '37',
    pressure: { balloonGas: '32', balloonAir: '18' },
    slurryHeight: '7.6'
  };

  const digester2Data = {
    temperature: '36.5',
    pressure: { balloonGas: '30', balloonAir: '17' },
    slurryHeight: '7.3'
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Digesters</h2>
      <div className="space-y-6">
        <Digester unit="1" data={digester1Data} />
        <Digester unit="2" data={digester2Data} />
      </div>
    </div>
  );
};

export default DigestersSection;
