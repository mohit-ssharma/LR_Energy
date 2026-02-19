import React from 'react';
import { Droplets, TrendingDown, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

const DewPointMeter = ({ dashboardData }) => {
  // Get dew point value from API data or use default
  const current = dashboardData?.current || {};
  const lastUpdate = dashboardData?.last_update;
  
  const currentValue = current.dew_point ?? -68;

  // Format timestamp - always show Date + Time
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Generate trend data with range around current value
  const generateTrendData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: currentValue + (Math.random() * 7 - 3.5) // Range: currentValue ± 3.5
    }));
  };

  const trendData = generateTrendData();
  
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
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono text-slate-900" data-testid="dew-point-value">{currentValue.toFixed(1)}</span>
                  <span className="text-sm text-slate-500">mg/m³</span>
                </div>
              </div>
            </div>
            
            <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg bg-${status.color}-50 border border-${status.color}-200`}>
              <CheckCircle2 className={`w-5 h-5 text-${status.color}-600`} />
              <span className={`font-semibold text-${status.color}-700`}>{status.text}</span>
            </div>
            
            <div className="mt-4 text-center text-xs text-slate-400 font-mono">
              Last Updated: {formatTime(lastUpdate)}
            </div>
          </div>
          
          <div className="lg:col-span-4 p-5 bg-gradient-to-br from-white to-cyan-50/20">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Trend</h3>
            </div>
            
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }} 
                  stroke="#94a3b8"
                  tickFormatter={(val) => `${val}h`}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  stroke="#94a3b8"
                  domain={[-75, -60]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${val.toFixed(1)} mg/m³`, 'Dew Point']}
                />
                <ReferenceLine y={-65} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Warning', fill: '#f59e0b', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="lg:col-span-4 p-5 bg-gradient-to-br from-slate-50/50 to-white">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Thresholds</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-sm font-medium text-slate-700">Within Limits</span>
                <span className="text-sm font-mono text-emerald-700">&lt; -65</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-sm font-medium text-slate-700">Warning</span>
                <span className="text-sm font-mono text-amber-700">-65 to -50</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-sm font-medium text-slate-700">Critical</span>
                <span className="text-sm font-mono text-rose-700">-50 to +25</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-xs text-slate-500 mb-1">Target Range</div>
              <div className="text-lg font-bold font-mono text-slate-900">-70 to -65 mg/m³</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DewPointMeter;
