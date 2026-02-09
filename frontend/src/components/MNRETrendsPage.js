import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Eye, X, Maximize2 } from 'lucide-react';

function MNRETrendsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('area');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maximizedChart, setMaximizedChart] = useState(null);

  function generateTrendData(hours) {
    const data = [];
    for (let i = 0; i < hours; i++) {
      data.push({
        time: i,
        rawBiogas: 1250 + (Math.random() * 100 - 50),
        purifiedGas: 1180 + (Math.random() * 80 - 40),
        productGas: 1150 + (Math.random() * 70 - 35),
        ch4: 96.8 + (Math.random() * 1 - 0.5),
        co2: 2.9 + (Math.random() * 0.5 - 0.25),
        o2: 0.3 + (Math.random() * 0.1 - 0.05),
        h2s: 180 + (Math.random() * 30 - 15)
      });
    }
    return data;
  }

  const hours = timeRange === '1h' ? 60 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168;
  const trendData = generateTrendData(hours);

  // MNRE can only see these 2 parameter categories
  const parameterCategories = {
    'Gas Flow': [
      { key: 'rawBiogas', label: 'Raw Biogas Flow', color: '#10b981', unit: 'Nm³/hr' },
      { key: 'purifiedGas', label: 'Purified Gas Flow', color: '#8b5cf6', unit: 'Nm³/hr' },
      { key: 'productGas', label: 'Product Gas Flow', color: '#06b6d4', unit: 'Nm³/hr' }
    ],
    'Gas Composition': [
      { key: 'ch4', label: 'CH₄ Concentration', color: '#f59e0b', unit: '%' },
      { key: 'co2', label: 'CO₂ Concentration', color: '#8b5cf6', unit: '%' },
      { key: 'o2', label: 'O₂ Concentration', color: '#10b981', unit: '%' },
      { key: 'h2s', label: 'H₂S Content', color: '#ef4444', unit: 'ppm' }
    ]
  };

  const [selectedParams, setSelectedParams] = useState(
    Object.values(parameterCategories).flat().map(function(p) { return p.key; })
  );

  function toggleParameter(key) {
    if (selectedParams.includes(key)) {
      setSelectedParams(selectedParams.filter(function(k) { return k !== key; }));
    } else {
      setSelectedParams([...selectedParams, key]);
    }
  }

  function toggleCategory(category) {
    const categoryParams = parameterCategories[category].map(function(p) { return p.key; });
    const allSelected = categoryParams.every(function(key) { return selectedParams.includes(key); });
    
    if (allSelected) {
      setSelectedParams(selectedParams.filter(function(k) { return !categoryParams.includes(k); }));
    } else {
      const newParams = [...selectedParams];
      categoryParams.forEach(function(key) {
        if (!newParams.includes(key)) {
          newParams.push(key);
        }
      });
      setSelectedParams(newParams);
    }
  }

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  
  const allParameters = [];
  Object.values(parameterCategories).forEach(function(params) {
    params.forEach(function(p) { allParameters.push(p); });
  });

  function getFilteredCategories() {
    if (selectedCategory === 'all') {
      return parameterCategories;
    }
    const result = {};
    result[selectedCategory] = parameterCategories[selectedCategory];
    return result;
  }

  const filteredCategories = getFilteredCategories();

  // Build time range buttons
  const timeRangeButtons = [];
  ['1h', '12h', '24h', '7d'].forEach(function(range) {
    timeRangeButtons.push(
      <button
        key={range}
        onClick={function() { setTimeRange(range); }}
        data-testid={'mnre-time-range-' + range}
        className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' +
          (timeRange === range
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
      >
        {range}
      </button>
    );
  });

  // Build chart type buttons
  const chartTypeButtons = [];
  ['line', 'area'].forEach(function(type) {
    chartTypeButtons.push(
      <button
        key={type}
        onClick={function() { setChartType(type); }}
        data-testid={'mnre-chart-type-' + type}
        className={'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ' +
          (chartType === type
            ? 'bg-violet-700 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
      >
        {type}
      </button>
    );
  });

  // Build category options
  const categoryOptions = [<option key="all" value="all">All Categories</option>];
  Object.keys(parameterCategories).forEach(function(cat) {
    categoryOptions.push(<option key={cat} value={cat}>{cat}</option>);
  });

  // Build parameter toggles
  const parameterToggles = [];
  Object.keys(filteredCategories).forEach(function(category) {
    const params = filteredCategories[category];
    const categoryParams = params.map(function(p) { return p.key; });
    const selectedCount = categoryParams.filter(function(key) { return selectedParams.includes(key); }).length;
    
    const paramItems = params.map(function(param) {
      return (
        <label
          key={param.key}
          className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
          data-testid={'mnre-param-toggle-' + param.key}
        >
          <input
            type="checkbox"
            checked={selectedParams.includes(param.key)}
            onChange={function() { toggleParameter(param.key); }}
            className="w-3.5 h-3.5 rounded border-slate-300"
          />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: param.color }}></div>
          <span className="text-xs text-slate-600 flex-1">{param.label}</span>
        </label>
      );
    });

    parameterToggles.push(
      <div key={category} className="border-b border-slate-100 pb-3 last:border-0">
        <button
          onClick={function() { toggleCategory(category); }}
          className="w-full text-left mb-2 px-2 py-1 rounded hover:bg-slate-50 flex items-center justify-between"
        >
          <span className="text-sm font-semibold text-slate-700">{category}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {selectedCount}/{params.length}
          </span>
        </button>
        <div className="space-y-1 ml-2">
          {paramItems}
        </div>
      </div>
    );
  });

  // Build chart lines/areas
  const chartElements = selectedParams.map(function(paramKey) {
    const param = allParameters.find(function(p) { return p.key === paramKey; });
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
  });

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
              {timeRangeButtons}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Chart Type</span>
            </div>
            <div className="flex gap-2">
              {chartTypeButtons}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Category Filter</span>
            </div>
            <select
              value={selectedCategory}
              onChange={function(e) { setSelectedCategory(e.target.value); }}
              className="w-full px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {categoryOptions}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Parameter Selection */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-5 shadow-sm max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Parameters ({selectedParams.length})</h3>
          <div className="space-y-4">
            {parameterToggles}
          </div>
        </div>

        {/* Chart Visualization - NO Statistics Section */}
        <div className="lg:col-span-9 bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Visualization</h3>
          <ResponsiveContainer width="100%" height={500}>
            <ChartComponent data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                style={{ fontSize: '11px' }}
                tickFormatter={function(value) { return timeRange === '1h' ? value + 'm' : value + 'h'; }}
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
              {chartElements}
            </ChartComponent>
          </ResponsiveContainer>
          {/* Selected Parameter Statistics REMOVED as per requirement */}
        </div>
      </div>
    </div>
  );
}

export default MNRETrendsPage;
