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

  // Build chart lines/areas - NOT USED anymore, using split charts instead
  
  // Get categories to display based on selected parameters
  function getCategoriesToDisplay() {
    const categories = [];
    Object.keys(parameterCategories).forEach(function(categoryName) {
      const params = parameterCategories[categoryName];
      const hasSelected = params.some(function(p) { return selectedParams.includes(p.key); });
      if (hasSelected && (selectedCategory === 'all' || selectedCategory === categoryName)) {
        categories.push({ name: categoryName, params: params });
      }
    });
    return categories;
  }

  const categoriesToDisplay = getCategoriesToDisplay();

  // Render chart for a category (same as Head Office)
  function renderCategoryChart(categoryName, params, isMaximized) {
    const categorySelectedParams = params.filter(function(p) { return selectedParams.includes(p.key); });
    if (categorySelectedParams.length === 0) return null;

    const ChartComp = chartType === 'area' ? AreaChart : LineChart;
    const height = isMaximized ? 500 : 250;

    return (
      <div 
        key={categoryName}
        className={'bg-white rounded-lg border border-slate-200 p-4 shadow-sm ' + (isMaximized ? '' : 'cursor-pointer hover:shadow-md transition-shadow')}
        onClick={function() { if (!isMaximized) setMaximizedChart(categoryName); }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700">{categoryName}</h4>
          {!isMaximized && (
            <Maximize2 className="w-4 h-4 text-slate-400" />
          )}
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComp data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              style={{ fontSize: '10px' }}
              tickFormatter={function(value) { return timeRange === '1h' ? value + 'm' : value + 'h'; }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '11px'
              }}
            />
            {isMaximized && <Legend wrapperStyle={{ fontSize: '11px' }} />}
            {categorySelectedParams.map(function(param) {
              if (chartType === 'area') {
                return (
                  <Area
                    key={param.key}
                    type="monotone"
                    dataKey={param.key}
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
                    key={param.key}
                    type="monotone"
                    dataKey={param.key}
                    stroke={param.color}
                    strokeWidth={2}
                    dot={false}
                    name={param.label}
                  />
                );
              }
            })}
          </ChartComp>
        </ResponsiveContainer>
        {/* Legend for small charts */}
        {!isMaximized && (
          <div className="flex flex-wrap gap-2 mt-2">
            {categorySelectedParams.map(function(param) {
              return (
                <div key={param.key} className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: param.color }}></div>
                  <span className="text-xs text-slate-600">{param.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Maximized chart modal
  function renderMaximizedModal() {
    if (!maximizedChart) return null;
    
    const params = parameterCategories[maximizedChart];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">{maximizedChart} - Detailed View</h3>
            <button 
              onClick={function() { setMaximizedChart(null); }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {renderCategoryChart(maximizedChart, params, true)}
          </div>
        </div>
      </div>
    );
  }

  // Build category charts
  const categoryCharts = categoriesToDisplay.map(function(cat) {
    return renderCategoryChart(cat.name, cat.params, false);
  });

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="mnre-trends-page">
      {renderMaximizedModal()}
      
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

        {/* Chart Visualization - Split by Category like Head Office */}
        <div className="lg:col-span-9 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Data Visualization <span className="text-sm font-normal text-slate-500">(Click chart to maximize)</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryCharts}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MNRETrendsPage;
