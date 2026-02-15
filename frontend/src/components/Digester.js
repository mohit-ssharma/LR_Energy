import React from 'react';
import { Thermometer, Gauge, Layers, Activity, Fuel } from 'lucide-react';

const Digester = ({ unit, data, lastUpdate }) => {
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour12: false });
  };

  const timeStr = formatTime(lastUpdate);

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
        <div className="text-xs text-slate-400 mt-2 font-mono">{timeStr}</div>
      </div>
    );
  };

  // Get slurry status based on height (max 8.2m)
  const getSlurryStatus = (height) => {
    const percentage = (parseFloat(height) / 8.2) * 100;
    if (percentage < 30) return { status: 'Low', color: 'bg-amber-500' };
    if (percentage <= 85) return { status: 'Normal', color: 'bg-emerald-500' };
    return { status: 'High', color: 'bg-rose-500' };
  };

  // Tank Visualization Component (for Slurry Height and Gas Level)
  const TankVisualization = ({ label, value, maxValue, unit, status, color, testId }) => {
    const percentage = (parseFloat(value) / maxValue) * 100;
    
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">{label}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1 mb-1">
              <span className="text-2xl font-bold font-mono text-slate-900" data-testid={testId}>{value}</span>
              <span className="text-sm font-medium text-slate-500">{unit}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              status === 'Normal' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
              status === 'Low' ? 'bg-amber-100 text-amber-700 border-amber-200' :
              status === 'High' ? 'bg-rose-100 text-rose-700 border-rose-200' :
              status === 'Operational' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
              'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              {status}
            </span>
            {maxValue === 8.2 && (
              <div className="text-xs text-slate-400 mt-1">Max: {maxValue} {unit}</div>
            )}
          </div>
          <div className="relative w-16 h-24 bg-slate-100 border-2 border-slate-300 rounded-lg overflow-hidden">
            <div 
              className={`absolute bottom-0 left-0 w-full ${color} opacity-80 transition-all duration-1000`}
              style={{ height: `${Math.min(percentage, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-30"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-sm font-bold font-mono text-white drop-shadow-lg">{percentage.toFixed(0)}%</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-2 font-mono">{timeStr}</div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Temperature Section - Bottom & Top */}
          <div className="bg-gradient-to-br from-orange-50/50 to-red-50/30 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center space-x-2 mb-3">
              <Thermometer className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Temperature</h4>
            </div>
            
            <div className="space-y-3">
              <MetricCard
                label="Bottom Temperature"
                value={data.tempBottom}
                unit="°C"
                min={30}
                max={40}
                color="bg-gradient-to-r from-orange-400 to-red-500"
                testId={`digester-${unit}-temp-bottom`}
              />
              <MetricCard
                label="Top Temperature"
                value={data.tempTop}
                unit="°C"
                min={30}
                max={40}
                color="bg-gradient-to-r from-orange-400 to-red-500"
                testId={`digester-${unit}-temp-top`}
              />
            </div>
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

          {/* Levels Section - Gas Level */}
          <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center space-x-2 mb-3">
              <Fuel className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Gas Level</h4>
            </div>
            
            <TankVisualization 
              label="Balloon Gas Level"
              value={data.gasLevel}
              maxValue={100}
              unit="%"
              status="Operational"
              color="bg-amber-500"
              testId={`digester-${unit}-gas-level`}
            />
          </div>

          {/* Slurry Height Section - Tank Design */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700">Slurry Level</h4>
            </div>
            
            <TankVisualization 
              label="Slurry Height"
              value={data.slurryHeight}
              maxValue={8.2}
              unit="m"
              status={getSlurryStatus(data.slurryHeight).status}
              color={getSlurryStatus(data.slurryHeight).color}
              testId={`digester-${unit}-slurry-height`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DigestersSection = ({ dashboardData }) => {
  // Get data from API response or use defaults
  const current = dashboardData?.current || {};
  const lastUpdate = dashboardData?.last_update;
  
  const digester1Data = {
    tempBottom: current.d1_temp_bottom?.toFixed(1) ?? '37.0',
    tempTop: current.d1_temp_top?.toFixed(1) ?? '36.5',
    pressure: { 
      balloonGas: current.d1_gas_pressure?.toFixed(1) ?? '32.0', 
      balloonAir: current.d1_air_pressure?.toFixed(1) ?? '18.0' 
    },
    gasLevel: current.d1_gas_level?.toFixed(0) ?? '75',
    slurryHeight: current.d1_slurry_height?.toFixed(1) ?? '7.6'
  };

  const digester2Data = {
    tempBottom: current.d2_temp_bottom?.toFixed(1) ?? '36.5',
    tempTop: current.d2_temp_top?.toFixed(1) ?? '36.0',
    pressure: { 
      balloonGas: current.d2_gas_pressure?.toFixed(1) ?? '30.0', 
      balloonAir: current.d2_air_pressure?.toFixed(1) ?? '17.0' 
    },
    gasLevel: current.d2_gas_level?.toFixed(0) ?? '72',
    slurryHeight: current.d2_slurry_height?.toFixed(1) ?? '7.3'
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Digesters</h2>
      <div className="space-y-6">
        <Digester unit="1" data={digester1Data} lastUpdate={lastUpdate} />
        <Digester unit="2" data={digester2Data} lastUpdate={lastUpdate} />
      </div>
    </div>
  );
};

export default DigestersSection;
