import React from 'react';
import { Droplets, TrendingDown, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

const DewPointMeter = () => {
  // Generate trend data with range -70 to -63
  const generateTrendData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: -70 + Math.random() * 7 // Range: -70 to -63
    }));
  };

  const trendData = generateTrendData();
  const currentValue = -68;
  
  // Status logic:
  // < -65 → Within Limits
  // -65 to -50 → Warning
  // -50 to +25 → Critical
  const getStatus = (val) => {
    if (val < -65) return { text: 'Within Limits', color: 'emerald' };
    if (val >= -65 && val <= -50) return { text: 'Warning', color: 'amber' };
    return { text: 'Critical', color: 'rose' };
  };
  
  const status = getStatus(currentValue);

  return (
    <div className="mb-6" data-testid="dew-point-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Dew Point Meter</h2>
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="lg:col-span-4 p-5 bg-gradient-to-br from-cyan-50/30 to-white">
            <div className="flex items-center space-x-2 mb-4">
              <Droplets className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg font-medium text-slate-700">Dew Point Status</h3>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative inline-block">
                <svg className="transform -rotate-90" width="180" height="180">
                  <circle
                    cx="90"
                    cy="90"
                    r="75"
                    stroke="#e2e8f0"
                    strokeWidth="14"
                    fill="none"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r="75"
                    stroke="#06b6d4"
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 75}`}
                    strokeDashoffset={`${2 * Math.PI * 75 * 0.32}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-4xl font-bold font-mono tracking-tighter text-slate-900" data-testid="dew-point-value">{currentValue}</div>
                  <div className="text-sm font-medium text-slate-500">mg/m³</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Moisture Content</span>
                  <span className="text-xs text-slate-400 font-mono">08:43:41</span>
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">{currentValue} mg/m³</div>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200 flex-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="font-semibold">-0.5 mg/m³</span>
                </div>
                <div className="text-xs text-slate-500">vs last hour</div>
              </div>
              
              <div className={`bg-${status.color}-50 border border-${status.color}-200 rounded-lg p-3`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 bg-${status.color}-500 rounded-full animate-pulse-subtle`}></div>
                  <span className={`text-sm font-semibold text-${status.color}-700`}>{status.text}</span>
                </div>
                <p className={`text-xs text-${status.color}-600 mt-1`}>All parameters within limits</p>
              </div>
              
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Sensor ID: DPM-001</span>
                <span className="font-mono">Feb 01, 2026</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-8 p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-700">24-Hour Trend Analysis</h3>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-cyan-600"></div>
                  <span className="text-slate-600">Current: {currentValue} mg/m³</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-amber-500 border-dashed"></div>
                  <span className="text-slate-600">Warning: -65 mg/m³</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-0.5 bg-rose-500 border-dashed"></div>
                  <span className="text-slate-600">Critical: -50 mg/m³</span>
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#94a3b8" 
                  style={{ fontSize: '11px', fontFamily: 'Inter' }}
                  tickFormatter={(value) => `${value}h`}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  style={{ fontSize: '11px', fontFamily: 'Inter' }}
                  domain={[-75, -40]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value.toFixed(2)} mg/m³`, 'Dew Point']}
                />
                <ReferenceLine 
                  y={-65} 
                  stroke="#f59e0b" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={{ value: 'Warning', fill: '#f59e0b', fontSize: 10 }}
                />
                <ReferenceLine 
                  y={-50} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={{ value: 'Critical', fill: '#ef4444', fontSize: 10 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Current</div>
                <div className="text-xl font-bold font-mono text-slate-900">{currentValue}</div>
                <div className="text-xs text-slate-500">mg/m³</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Average</div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {(trendData.reduce((sum, d) => sum + d.value, 0) / trendData.length).toFixed(1)}
                </div>
                <div className="text-xs text-slate-500">mg/m³</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Max</div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {Math.max(...trendData.map(d => d.value)).toFixed(1)}
                </div>
                <div className="text-xs text-slate-500">mg/m³</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Min</div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {Math.min(...trendData.map(d => d.value)).toFixed(1)}
                </div>
                <div className="text-xs text-slate-500">mg/m³</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DewPointMeter;
