import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Calendar, Filter } from 'lucide-react';

const TrendsPage = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('area');

  const generateTrendData = (hours) => {
    return Array.from({ length: hours }, (_, i) => ({
      time: `${i}h`,
      rawBiogas: 340 + Math.random() * 20,
      purifiedGas: 315 + Math.random() * 15,
      productGas: 240 + Math.random() * 25,
      ch4: 96 + Math.random() * 2,
      dewPoint: 2.5 + Math.random() * 1.5
    }));
  };

  const trendData = generateTrendData(timeRange === '1h' ? 60 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168);

  const parameters = [
    { key: 'rawBiogas', label: 'Raw Biogas Flow', color: '#3b82f6', unit: 'Nm³/hr' },
    { key: 'purifiedGas', label: 'Purified Gas Flow', color: '#10b981', unit: 'Nm³/hr' },
    { key: 'productGas', label: 'Product Gas Flow', color: '#8b5cf6', unit: 'Kg/hr' },
    { key: 'ch4', label: 'CH₄ Concentration', color: '#f59e0b', unit: '%' },
    { key: 'dewPoint', label: 'Dew Point', color: '#06b6d4', unit: 'mg/m³' }
  ];

  const [selectedParams, setSelectedParams] = useState(['rawBiogas', 'purifiedGas', 'productGas']);

  const toggleParameter = (key) => {
    setSelectedParams(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;

  return (
    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-white min-h-screen" data-testid="trends-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <span>Historical Trends Analysis</span>
        </h1>
        <p className="text-gray-600">Analyze historical data patterns and performance metrics</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Time Range:</span>
            <div className="flex space-x-2">
              {['1h', '12h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  data-testid={`time-range-${range}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Chart Type:</span>
            <div className="flex space-x-2">
              {['line', 'area'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  data-testid={`chart-type-${type}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    chartType === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Parameters</h3>
          <div className="space-y-2">
            {parameters.map((param) => (
              <label
                key={param.key}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                data-testid={`param-toggle-${param.key}`}
              >
                <input
                  type="checkbox"
                  checked={selectedParams.includes(param.key)}
                  onChange={() => toggleParameter(param.key)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: param.color }}></div>
                <span className="text-sm text-gray-700 flex-1">{param.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Visualization</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ChartComponent data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              {selectedParams.map((paramKey) => {
                const param = parameters.find(p => p.key === paramKey);
                if (chartType === 'area') {
                  return (
                    <Area
                      key={paramKey}
                      type="monotone"
                      dataKey={paramKey}
                      stroke={param.color}
                      fill={param.color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      name={param.label}
                    />
                  );
                } else {
                  return (
                    <Line
                      key={paramKey}
                      type="monotone"
                      dataKey={paramKey}
                      stroke={param.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={param.label}
                    />
                  );
                }
              })}
            </ChartComponent>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            {selectedParams.map((paramKey) => {
              const param = parameters.find(p => p.key === paramKey);
              const latestValue = trendData[trendData.length - 1][paramKey];
              const avgValue = (trendData.reduce((sum, d) => sum + d[paramKey], 0) / trendData.length).toFixed(2);
              const minValue = Math.min(...trendData.map(d => d[paramKey])).toFixed(2);
              const maxValue = Math.max(...trendData.map(d => d[paramKey])).toFixed(2);

              return (
                <div key={paramKey} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: param.color }}></div>
                    <span className="text-xs font-semibold text-gray-700 truncate">{param.label}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Current:</span>
                      <span className="font-semibold text-gray-800">{latestValue.toFixed(2)} {param.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg:</span>
                      <span className="font-semibold text-gray-800">{avgValue} {param.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min:</span>
                      <span className="font-semibold text-gray-800">{minValue} {param.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max:</span>
                      <span className="font-semibold text-gray-800">{maxValue} {param.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsPage;
