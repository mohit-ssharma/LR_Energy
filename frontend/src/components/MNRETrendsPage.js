import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Eye } from 'lucide-react';

const MNRETrendsPage = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('area');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const generateTrendData = (hours) => {
    return Array.from({ length: hours }, (_, i) => ({
      time: i,
      rawBiogas: 340 + Math.random() * 20,
      purifiedGas: 315 + Math.random() * 15,
      productGas: 240 + Math.random() * 25,
      ch4: 96 + Math.random() * 2,
      co2: 2.5 + Math.random() * 1,
      o2: 0.4 + Math.random() * 0.1,
      h2s: 10 + Math.random() * 5
    }));
  };

  const trendData = generateTrendData(timeRange === '1h' ? 60 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168);

  // MNRE can only see these 4 parameter categories
  const parameterCategories = {
    'Gas Flow': [
      { key: 'rawBiogas', label: 'Raw Biogas Flow', color: '#10b981', unit: 'Nm³/hr' },
      { key: 'purifiedGas', label: 'Purified Gas Flow', color: '#8b5cf6', unit: 'Nm³/hr' },
      { key: 'productGas', label: 'Product Gas Flow', color: '#06b6d4', unit: 'Kg/hr' }
    ],
    'Gas Composition': [
      { key: 'ch4', label: 'CH₄ Concentration', color: '#f59e0b', unit: '%' },
      { key: 'co2', label: 'CO₂ Concentration', color: '#8b5cf6', unit: '%' },
      { key: 'o2', label: 'O₂ Concentration', color: '#10b981', unit: '%' },
      { key: 'h2s', label: 'H₂S Concentration', color: '#ef4444', unit: 'ppm' }
    ]
  };

  const [selectedParams, setSelectedParams] = useState(
    Object.values(parameterCategories).flat().map(p => p.key)
  );

  const toggleParameter = (key) => {
    setSelectedParams(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleCategory = (category) => {
    const categoryParams = parameterCategories[category].map(p => p.key);
    const allSelected = categoryParams.every(key => selectedParams.includes(key));
    
    if (allSelected) {
      setSelectedParams(prev => prev.filter(k => !categoryParams.includes(k)));
    } else {
      setSelectedParams(prev => [...new Set([...prev, ...categoryParams])]);
    }
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const allParameters = Object.values(parameterCategories).flat();

  const getStatistics = (paramKey) => {
    const values = trendData.map(d => d[paramKey]);
    const latest = values[values.length - 1];
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { latest, avg, min, max };
  };

  const filteredCategories = selectedCategory === 'all' 
    ? parameterCategories 
    : { [selectedCategory]: parameterCategories[selectedCategory] };

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="mnre-trends-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-2 flex items-center space-x-3">
          <TrendingUp className="w-7 h-7 text-emerald-600" />
          <span>Historical Trends Analysis</span>
        </h1>
        <p className="text-slate-600">Analyze historical data patterns for Gas Flow and Gas Composition parameters</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Time Range</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['1h', '12h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  data-testid={`mnre-time-range-${range}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Chart Type</span>
            </div>
            <div className="flex gap-2">
              {['line', 'area'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  data-testid={`mnre-chart-type-${type}`}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                    chartType === type
                      ? 'bg-violet-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Category Filter</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Categories</option>
              {Object.keys(parameterCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Parameter Selection */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-5 shadow-sm max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Parameters ({selectedParams.length})</h3>
          <div className="space-y-4">
            {Object.entries(filteredCategories).map(([category, params]) => (
              <div key={category} className="border-b border-slate-100 pb-3 last:border-0">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full text-left mb-2 px-2 py-1 rounded hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-slate-700">{category}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {params.filter(p => selectedParams.includes(p.key)).length}/{params.length}
                  </span>
                </button>
                <div className="space-y-1 ml-2">
                  {params.map((param) => (
                    <label
                      key={param.key}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                      data-testid={`mnre-param-toggle-${param.key}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedParams.includes(param.key)}
                        onChange={() => toggleParameter(param.key)}
                        className="w-3.5 h-3.5 rounded border-slate-300"
                      />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: param.color }}></div>
                      <span className="text-xs text-slate-600 flex-1">{param.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="lg:col-span-9 bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Visualization</h3>
          <ResponsiveContainer width="100%" height={450}>
            <ChartComponent data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                style={{ fontSize: '11px' }}
                tickFormatter={(value) => timeRange === '1h' ? `${value}m` : `${value}h`}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {selectedParams.map((paramKey) => {
                const param = allParameters.find(p => p.key === paramKey);
                if (!param) return null;
                
                if (chartType === 'area') {
                  return (
                    <Area
                      key={paramKey}
                      type="monotone"
                      dataKey={paramKey}
                      stroke={param.color}
                      fill={param.color}
                      fillOpacity={0.2}
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
                      dot={false}
                      name={param.label}
                    />
                  );
                }
              })}
            </ChartComponent>
          </ResponsiveContainer>

          {/* Statistics Grid */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Selected Parameters Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {selectedParams.map((paramKey) => {
                const param = allParameters.find(p => p.key === paramKey);
                if (!param) return null;
                const stats = getStatistics(paramKey);

                return (
                  <div key={paramKey} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: param.color }}></div>
                      <span className="text-xs font-semibold text-slate-700 truncate">{param.label}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current:</span>
                        <span className="font-bold font-mono text-slate-800">{stats.latest.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Avg:</span>
                        <span className="font-semibold font-mono text-slate-700">{stats.avg.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Min:</span>
                        <span className="font-semibold font-mono text-slate-700">{stats.min.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max:</span>
                        <span className="font-semibold font-mono text-slate-700">{stats.max.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-200">{param.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MNRETrendsPage;
