import React from 'react';
import { Droplets, TrendingDown, AlertCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

const DewPointMeter = () => {
  const generateTrendData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      value: 2.5 + Math.random() * 1.5
    }));
  };

  const trendData = generateTrendData();
  const currentValue = 2.85;
  const limit = 5.0;
  const warningLevel = 4.0;
  const percentage = (currentValue / limit) * 100;

  return (
    <div className="mb-8" data-testid="dew-point-section">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dew Point Meter</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Droplets className="w-6 h-6 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-700">Dew Point</h3>
            </div>
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <svg className="transform -rotate-90" width="160" height="160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#06b6d4"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-3xl font-bold text-gray-800" data-testid="dew-point-value">{currentValue}</div>
                  <div className="text-sm text-gray-500">mg/m³</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Moisture Content</span>
                <span className="font-semibold text-gray-800">{currentValue} mg/m³</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <TrendingDown className="w-4 h-4" />
                <span>-0.15 mg/m³ vs last hour</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Normal</span>
              </div>
              <div className="text-xs text-gray-400">Feb 01, 2026, 08:43:41</div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-cyan-600">{percentage.toFixed(0)}%</span> of limit
              </div>
              <div className="text-xs text-gray-500 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Sensor ID: DPM-001</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">24-Hour Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                  domain={[0, 6]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <ReferenceLine 
                  y={warningLevel} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  label={{ value: 'Warning: 4.0 mg/m³', fill: '#f59e0b', fontSize: 12 }}
                />
                <ReferenceLine 
                  y={limit} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  label={{ value: 'Critical: 5.0 mg/m³', fill: '#ef4444', fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 font-medium">Operating within normal parameters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DewPointMeter;
