import React from 'react';
import { Droplet, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const WaterFlowMeters = () => {
  // Updated dummy data - All with Totalizer
  const flowMeters = [
    { id: 'feed-fm1', name: 'Feed FM-I', value: 42, unit: 'm³/hr', totalizer: 1008, totalizerUnit: 'm³', color: 'emerald' },
    { id: 'feed-fm2', name: 'Feed FM-II', value: 38, unit: 'm³/hr', totalizer: 912, totalizerUnit: 'm³', color: 'cyan' },
    { id: 'fresh-water', name: 'Fresh Water FM', value: 12, unit: 'm³/hr', totalizer: 288, totalizerUnit: 'm³', color: 'violet' },
    { id: 'recycle', name: 'Recycle Water FM', value: 26, unit: 'm³/hr', totalizer: 624, totalizerUnit: 'm³', color: 'amber' }
  ];

  const generateTrendData = (baseValue) => {
    return Array.from({ length: 12 }, (_, i) => ({
      time: i,
      value: baseValue + (Math.random() * 5 - 2.5)
    }));
  };

  const colorClasses = {
    emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', stroke: '#10b981' },
    cyan: { bg: 'bg-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', stroke: '#06b6d4' },
    violet: { bg: 'bg-violet-700', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', stroke: '#7c3aed' },
    amber: { bg: 'bg-amber-600', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', stroke: '#f59e0b' }
  };

  // Calculate totals
  const totalFeedFlow = flowMeters[0].value + flowMeters[1].value;
  const totalWaterFlow = flowMeters.reduce((sum, m) => sum + m.value, 0);
  const totalTotalizer = flowMeters.reduce((sum, m) => sum + m.totalizer, 0);

  return (
    <div className="mb-6" data-testid="water-flow-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Water Flow Meters</h2>
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-600 rounded-md">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800">Flow Meter Status</h3>
              <span className="text-xs text-slate-500">Real-time flow measurements with 24Hr totalizers</span>
            </div>
          </div>
          <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 font-semibold">
            All Online
          </span>
        </div>

        <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {flowMeters.map((meter) => {
              const colors = colorClasses[meter.color];
              const trendData = generateTrendData(meter.value);
              
              return (
                <div 
                  key={meter.id} 
                  className={`${colors.light} rounded-lg p-4 border ${colors.border}`}
                  data-testid={`flow-meter-${meter.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 ${colors.bg} rounded-md`}>
                        <Droplet className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{meter.name}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-1">Current Flow</div>
                    <div className="flex items-baseline space-x-1 mb-1">
                      <span className={`text-3xl font-bold font-mono ${colors.text}`}>{meter.value}</span>
                      <span className="text-sm font-medium text-slate-500">{meter.unit}</span>
                    </div>
                  </div>

                  <div className="h-12 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}
                          formatter={(value) => [`${value.toFixed(1)} m³/hr`, 'Flow']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={colors.stroke}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Totalizer Box */}
                  <div className="bg-white/80 rounded-md p-2 border border-slate-200 mb-2">
                    <div className="text-xs text-slate-500">Totalizer (24 Hr)</div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-lg font-bold font-mono text-slate-900">{meter.totalizer.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">{meter.totalizerUnit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Status: Online</span>
                    <span className="font-mono">08:43:41</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Individual flow meters only - no totals */}
        </div>
      </div>
    </div>
  );
};

export default WaterFlowMeters;
