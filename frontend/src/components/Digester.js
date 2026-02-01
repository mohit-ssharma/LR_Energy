import React from 'react';
import { Thermometer, Gauge, Layers, Activity } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const Digester = ({ unit, data }) => {
  const tempComparisonData = [
    { name: 'Bottom', value: parseFloat(data.temperature.bottom), color: '#f59e0b' },
    { name: 'Top', value: parseFloat(data.temperature.top), color: '#ef4444' }
  ];

  const MetricCard = ({ label, value, unit, min, max, color, testId }) => {
    const percentage = max ? ((value - min) / (max - min)) * 100 : 0;
    
    return (
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</div>
        <div className="flex items-baseline space-x-1 mb-2">
          <span className="text-2xl font-bold font-mono text-slate-900" data-testid={testId}>{value}</span>
          <span className="text-sm font-medium text-slate-400">{unit}</span>
        </div>
        {min !== undefined && max !== undefined && (
          <>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{min}{unit}</span>
              <span>{max}{unit}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${color} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </>
        )}
        <div className="text-xs text-slate-400 mt-2 font-mono">08:43:41</div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`digester-${unit}-section`}>
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-violet-700 rounded-md">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-700">Digester {unit}</h3>
            <span className="text-xs text-slate-500">Unit {unit} - Active</span>
          </div>
        </div>
        <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 font-semibold">
          Operational
        </span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Temperature Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Thermometer className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Temperature</h4>
            </div>
            
            <div className="space-y-3">
              <MetricCard
                label="Bottom Temp"
                value={data.temperature.bottom}
                unit="°C"
                min={35}
                max={42}
                color="bg-gradient-to-r from-orange-400 to-red-500"
                testId={`digester-${unit}-temp-bottom`}
              />
              
              <MetricCard
                label="Top Temp"
                value={data.temperature.top}
                unit="°C"
                min={35}
                max={42}
                color="bg-gradient-to-r from-orange-400 to-red-500"
                testId={`digester-${unit}-temp-top`}
              />
              
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Comparison</div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={tempComparisonData}>
                    <XAxis dataKey="name" style={{ fontSize: '11px' }} stroke="#94a3b8" />
                    <YAxis hide domain={[35, 42]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {tempComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pressure Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Gauge className="w-4 h-4 text-cyan-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pressure</h4>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Balloon Gas</div>
                <div className="flex items-baseline space-x-1 mb-2">
                  <span className="text-2xl font-bold font-mono text-slate-900" data-testid={`digester-${unit}-gas-pressure`}>
                    {data.pressure.balloonGas}
                  </span>
                  <span className="text-sm font-medium text-slate-400">mmWC</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{Math.round((parseFloat(data.pressure.balloonGas) / 200) * 100)}%</span>
                  <span>Max: 200</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                    style={{ width: `${(parseFloat(data.pressure.balloonGas) / 200) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">08:43:41</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Balloon Air</div>
                <div className="flex items-baseline space-x-1 mb-2">
                  <span className="text-2xl font-bold font-mono text-slate-900" data-testid={`digester-${unit}-air-pressure`}>
                    {data.pressure.balloonAir}
                  </span>
                  <span className="text-sm font-medium text-slate-400">mmWC</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{Math.round((parseFloat(data.pressure.balloonAir) / 150) * 100)}%</span>
                  <span>Max: 150</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                    style={{ width: `${(parseFloat(data.pressure.balloonAir) / 150) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">08:43:41</div>
              </div>
            </div>
          </div>

          {/* Levels Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Levels</h4>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Gas Level</div>
                <div className="flex items-baseline space-x-1 mb-2">
                  <span className="text-2xl font-bold font-mono text-slate-900" data-testid={`digester-${unit}-gas-level`}>
                    {data.levels.gasLevel}
                  </span>
                  <span className="text-sm font-medium text-slate-400">%</span>
                </div>
                <div className="relative h-20 bg-slate-200 rounded-lg overflow-hidden mt-2">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ height: `${data.levels.gasLevel}%` }}
                  >
                    <div className="absolute top-2 left-0 right-0 text-center text-white text-xs font-bold drop-shadow">
                      {data.levels.gasLevel}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">08:43:41</div>
              </div>

              <MetricCard
                label="Balloon Air Level"
                value={data.levels.balloonAirLevel}
                unit="mmWC"
                testId={`digester-${unit}-air-level`}
              />

              <MetricCard
                label="Slurry Height"
                value={data.levels.slurryLevelHeight}
                unit="Meter"
                testId={`digester-${unit}-slurry-level`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DigestersSection = () => {
  const digester1Data = {
    temperature: { bottom: '38.5', top: '39.2' },
    pressure: { balloonGas: '152.3', balloonAir: '98.5' },
    levels: { gasLevel: '78.5', balloonAirLevel: '125.8', slurryLevelHeight: '4.25' }
  };

  const digester2Data = {
    temperature: { bottom: '37.8', top: '38.6' },
    pressure: { balloonGas: '148.7', balloonAir: '96.2' },
    levels: { gasLevel: '76.2', balloonAirLevel: '122.3', slurryLevelHeight: '4.18' }
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
