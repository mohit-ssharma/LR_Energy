import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Eye, X, Maximize2, RefreshCw, Wifi, WifiOff, Database, AlertTriangle } from 'lucide-react';
import { getTrendsData } from '../services/api';

function MNRETrendsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('area');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maximizedChart, setMaximizedChart] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [apiStats, setApiStats] = useState(null);
  const [apiStatistics, setApiStatistics] = useState(null);
  const [error, setError] = useState(null);

  // Transform API data to chart format
  const transformApiData = (apiData, hours) => {
    if (!apiData || apiData.length === 0) return [];
    
    return apiData.map((row) => {
      // Use appropriate label based on time range
      let timeLabel;
      if (hours >= 168) {
        // 7 days - use day label
        timeLabel = row.day_label || row.day_name || '';
      } else {
        // 1hr, 12hr, 24hr - use time label
        timeLabel = row.time_label || '';
      }
      
      return {
        time: timeLabel,
        timestamp: row.timestamp,
        recordsInInterval: row.records_in_interval || 0,
        rawBiogas: parseFloat(row.raw_biogas_flow) || 0,
        purifiedGas: parseFloat(row.purified_gas_flow) || 0,
        productGas: parseFloat(row.product_gas_flow) || 0,
        ch4: parseFloat(row.ch4_concentration) || 0,
        co2: parseFloat(row.co2_level) || 0,
        o2: parseFloat(row.o2_concentration) || 0,
        h2s: parseFloat(row.h2s_content) || 0
      };
    });
  };

  // Fetch data from API - NO MOCK DATA
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hours = timeRange === '1h' ? 1 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168;
      const result = await getTrendsData(hours, null, false);  // raw=false for interval grouping
      
      if (result.success && result.data?.data) {
        const transformedData = transformApiData(result.data.data, hours);
        setTrendData(transformedData);
        setApiStats({
          dataPoints: result.data.data_points,
          totalRecords: result.data.total_records,
          expectedIntervals: result.data.expected_intervals,
          coveragePercent: result.data.coverage_percent,
          intervalLabel: result.data.query?.interval_label
        });
        setApiStatistics(result.data.statistics || null);
        setIsConnected(true);
      } else {
        // API failed - show error, NO mock data
        setTrendData([]);
        setApiStats(null);
        setApiStatistics(null);
        setIsConnected(false);
        setError(result.error || 'Failed to fetch data from server');
      }
    } catch (err) {
      console.error('MNRE Trends API error:', err);
      setTrendData([]);
      setApiStats(null);
      setApiStatistics(null);
      setIsConnected(false);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Initial fetch and when timeRange changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // MNRE can only see these 2 parameter categories (Gas Flow and Gas Composition)
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

  // Map frontend param keys to backend param names for statistics
  const paramKeyToBackend = {
    'rawBiogas': 'raw_biogas_flow',
    'purifiedGas': 'purified_gas_flow',
    'productGas': 'product_gas_flow',
    'ch4': 'ch4_concentration',
    'co2': 'co2_level',
    'o2': 'o2_concentration',
    'h2s': 'h2s_content'
  };

  // Get statistics from API response (database values only)
  function getStatistics(paramKey) {
    const backendKey = paramKeyToBackend[paramKey];
    if (apiStatistics && backendKey && apiStatistics[backendKey]) {
      const stats = apiStatistics[backendKey];
      return {
        avg12hr: stats.avg_12hr || 0,
        avg24hr: stats.avg_24hr || 0,
        min: stats.min || 0,
        max: stats.max || 0
      };
    }
    // No data available
    return { avg12hr: 0, avg24hr: 0, min: 0, max: 0 };
  }

  // Build time range buttons
  const timeRangeButtons = [];
  [
    { value: '1h', label: '1 Hr' },
    { value: '12h', label: '12 Hr' },
    { value: '24h', label: '24 Hr' },
    { value: '7d', label: '7 Days' }
  ].forEach(function(range) {
    timeRangeButtons.push(
      <button
        key={range.value}
        onClick={function() { setTimeRange(range.value); }}
        data-testid={'mnre-time-range-' + range.value}
        className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' +
          (timeRange === range.value
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
      >
        {range.label}
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

  // Build statistics cards - Only from database
  const statisticsCards = [];
  selectedParams.forEach(function(paramKey) {
    const param = allParameters.find(function(p) { return p.key === paramKey; });
    if (!param) return;
    const stats = getStatistics(paramKey);
    
    // H2S should display as integer
    const isH2S = paramKey === 'h2s';
    const formatValue = (val) => {
      if (val === 0 || val === null || val === undefined) return '--';
      return isH2S ? Math.round(val) : val.toFixed(2);
    };

    statisticsCards.push(
      <div key={paramKey} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: param.color }}></div>
          <span className="text-xs font-semibold text-slate-700 truncate">{param.label}</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">12-Hr Avg:</span>
            <span className="font-bold font-mono text-slate-800">{formatValue(stats.avg12hr)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">24-Hr Avg:</span>
            <span className="font-semibold font-mono text-slate-700">{formatValue(stats.avg24hr)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Min:</span>
            <span className="font-semibold font-mono text-emerald-600">{formatValue(stats.min)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Max:</span>
            <span className="font-semibold font-mono text-rose-600">{formatValue(stats.max)}</span>
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-200">{param.unit}</div>
        </div>
      </div>
    );
  });

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

  // Render chart for a category
  function renderCategoryChart(categoryName, params, isMaximized) {
    const categorySelectedParams = params.filter(function(p) { return selectedParams.includes(p.key); });
    if (categorySelectedParams.length === 0) return null;

    // Check if we have data
    if (!trendData || trendData.length === 0) {
      return (
        <div key={categoryName} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">{categoryName}</h4>
          <div className="flex items-center justify-center h-48 bg-slate-50 rounded-lg">
            <div className="text-center text-slate-500">
              <Database className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm">No data available</p>
            </div>
          </div>
        </div>
      );
    }

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
              interval={0}
              angle={timeRange === '7d' ? 0 : -45}
              textAnchor={timeRange === '7d' ? 'middle' : 'end'}
              height={timeRange === '7d' ? 30 : 50}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '11px'
              }}
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value, name) => {
                const param = categorySelectedParams.find(p => p.key === name);
                return [`${value} ${param?.unit || ''}`, param?.label || name];
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
                    name={param.key}
                    connectNulls={true}
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
                    dot={{ r: 3 }}
                    name={param.key}
                    connectNulls={true}
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
        <p className="text-slate-600">Analyze Gas Flow and Gas Composition data from database</p>
      </div>

      {/* Connection Status & Stats */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {isConnected ? (
            <span className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
              <Wifi className="w-3 h-3" />
              <span>LIVE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-medium">
              <WifiOff className="w-3 h-3" />
              <span>OFFLINE</span>
            </span>
          )}
          {apiStats && (
            <>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {apiStats.dataPoints}/{apiStats.expectedIntervals} intervals
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {apiStats.totalRecords} total records
              </span>
              {apiStats.intervalLabel && (
                <span className="text-xs text-slate-500 bg-blue-50 px-2 py-1 rounded">
                  Interval: {apiStats.intervalLabel}
                </span>
              )}
            </>
          )}
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span className="text-sm text-rose-700">{error}</span>
        </div>
      )}

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

        {/* Chart Visualization */}
        <div className="lg:col-span-9 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Data Visualization 
            <span className="text-sm font-normal text-slate-500 ml-2">(Click chart to maximize)</span>
            {loading && <RefreshCw className="w-4 h-4 inline-block ml-2 animate-spin text-slate-400" />}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryCharts}
          </div>
        </div>
      </div>

      {/* Selected Parameter Statistics - From Database Only */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>Parameter Statistics (From Database)</span>
        </h3>
        {!isConnected || !apiStatistics ? (
          <div className="text-center py-8 text-slate-500">
            <Database className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No statistics available - Connect to database</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {statisticsCards}
          </div>
        )}
      </div>
    </div>
  );
}

export default MNRETrendsPage;
