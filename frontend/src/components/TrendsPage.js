import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Eye, X, Maximize2, Download, FileText, FileSpreadsheet, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { generatePDFReport, generateCSVDownload } from '../utils/pdfUtils';
import { getTrendsData } from '../services/api';

function TrendsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('area');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maximizedChart, setMaximizedChart] = useState(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [apiStats, setApiStats] = useState(null);

  // Generate mock data as fallback
  function generateMockData(hours) {
    const data = [];
    for (let i = 0; i < hours; i++) {
      data.push({
        time: i + 'h',
        rawBiogas: 1250 + (Math.random() * 100 - 50),
        purifiedGas: 1180 + (Math.random() * 80 - 40),
        productGas: 1150 + (Math.random() * 70 - 35),
        ch4: 96.8 + (Math.random() * 1 - 0.5),
        co2: 2.9 + (Math.random() * 0.5 - 0.25),
        o2: 0.3 + (Math.random() * 0.1 - 0.05),
        h2s: 180 + (Math.random() * 30 - 15),
        dewPoint: -68 + (Math.random() * 4 - 2),
        digester1Temp: 37 + (Math.random() * 2 - 1),
        digester2Temp: 36.5 + (Math.random() * 2 - 1),
        digester1GasPressure: 32 + (Math.random() * 4 - 2),
        digester2GasPressure: 30 + (Math.random() * 4 - 2),
        digester1AirPressure: 18 + (Math.random() * 2 - 1),
        digester2AirPressure: 17 + (Math.random() * 2 - 1),
        digester1SlurryHeight: 7.6 + (Math.random() * 0.4 - 0.2),
        digester2SlurryHeight: 7.3 + (Math.random() * 0.4 - 0.2),
        bufferTank: 82 + (Math.random() * 6 - 3),
        lagoonTank: 76 + (Math.random() * 6 - 3),
        feedFM1: 42 + (Math.random() * 4 - 2),
        feedFM2: 38 + (Math.random() * 4 - 2),
        freshWaterFM: 12 + (Math.random() * 2 - 1),
        recycleWaterFM: 26 + (Math.random() * 3 - 1.5)
      });
    }
    return data;
  }

  // Transform API data to chart format
  const transformApiData = (apiData) => {
    return (apiData || []).map((row) => ({
      time: row.timestamp ? new Date(row.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
      rawBiogas: parseFloat(row.raw_biogas_flow) || 0,
      purifiedGas: parseFloat(row.purified_gas_flow) || 0,
      productGas: parseFloat(row.product_gas_flow) || 0,
      ch4: parseFloat(row.ch4_concentration) || 0,
      co2: parseFloat(row.co2_level) || 0,
      o2: parseFloat(row.o2_concentration) || 0,
      h2s: parseFloat(row.h2s_content) || 0,
      dewPoint: parseFloat(row.dew_point) || 0,
      digester1Temp: parseFloat(row.d1_temp_bottom) || 0,
      digester2Temp: parseFloat(row.d2_temp_bottom) || 0,
      digester1GasPressure: parseFloat(row.d1_gas_pressure) || 0,
      digester2GasPressure: parseFloat(row.d2_gas_pressure) || 0,
      digester1AirPressure: parseFloat(row.d1_air_pressure) || 0,
      digester2AirPressure: parseFloat(row.d2_air_pressure) || 0,
      digester1SlurryHeight: parseFloat(row.d1_slurry_height) || 0,
      digester2SlurryHeight: parseFloat(row.d2_slurry_height) || 0,
      bufferTank: parseFloat(row.buffer_tank_level) || 0,
      lagoonTank: parseFloat(row.lagoon_tank_level) || 0,
      feedFM1: parseFloat(row.feed_fm1_flow) || 0,
      feedFM2: parseFloat(row.feed_fm2_flow) || 0,
      freshWaterFM: parseFloat(row.fresh_water_flow) || 0,
      recycleWaterFM: parseFloat(row.recycle_water_flow) || 0
    }));
  };

  // State for API statistics from backend
  const [apiStatistics, setApiStatistics] = useState(null);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const hours = timeRange === '1h' ? 1 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168;
      const result = await getTrendsData(hours);
      
      if (result.success && result.data?.data) {
        const transformedData = transformApiData(result.data.data);
        setTrendData(transformedData);
        setApiStats({
          dataPoints: result.data.data_points,
          totalRecords: result.data.total_records,
          expectedRecords: result.data.expected_records,
          coveragePercent: result.data.coverage_percent
        });
        // Store statistics from backend (includes 12hr and 24hr averages)
        setApiStatistics(result.data.statistics || null);
        setIsConnected(true);
      } else {
        // API failed - use mock data
        const mockHours = timeRange === '1h' ? 60 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168;
        setTrendData(generateMockData(mockHours));
        setApiStats(null);
        setApiStatistics(null);
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Trends API error:', err);
      const mockHours = timeRange === '1h' ? 60 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168;
      setTrendData(generateMockData(mockHours));
      setApiStats(null);
      setApiStatistics(null);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Fetch on mount and when time range changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
      { key: 'h2s', label: 'H₂S Content', color: '#ef4444', unit: 'ppm' },
      { key: 'dewPoint', label: 'Dew Point', color: '#06b6d4', unit: 'mg/m³' }
    ],
    'Digester 1': [
      { key: 'digester1Temp', label: 'D1 Temperature', color: '#ef4444', unit: '°C' },
      { key: 'digester1GasPressure', label: 'D1 Balloon Gas Pressure', color: '#06b6d4', unit: '' },
      { key: 'digester1AirPressure', label: 'D1 Balloon Air Pressure', color: '#0ea5e9', unit: '' },
      { key: 'digester1SlurryHeight', label: 'D1 Slurry Height', color: '#10b981', unit: 'm' }
    ],
    'Digester 2': [
      { key: 'digester2Temp', label: 'D2 Temperature', color: '#dc2626', unit: '°C' },
      { key: 'digester2GasPressure', label: 'D2 Balloon Gas Pressure', color: '#0891b2', unit: '' },
      { key: 'digester2AirPressure', label: 'D2 Balloon Air Pressure', color: '#06b6d4', unit: '' },
      { key: 'digester2SlurryHeight', label: 'D2 Slurry Height', color: '#059669', unit: 'm' }
    ],
    'Tank Levels': [
      { key: 'bufferTank', label: 'Buffer Tank Level', color: '#f59e0b', unit: '%' },
      { key: 'lagoonTank', label: 'Lagoon Tank Level', color: '#8b5cf6', unit: '%' }
    ],
    'Water Flow': [
      { key: 'feedFM1', label: 'Feed FM-I', color: '#10b981', unit: 'm³/hr' },
      { key: 'feedFM2', label: 'Feed FM-II', color: '#f59e0b', unit: 'm³/hr' },
      { key: 'freshWaterFM', label: 'Fresh Water FM', color: '#8b5cf6', unit: 'm³/hr' },
      { key: 'recycleWaterFM', label: 'Recycle Water FM', color: '#06b6d4', unit: 'm³/hr' }
    ]
  };

  const [selectedParams, setSelectedParams] = useState(['rawBiogas', 'purifiedGas', 'productGas', 'ch4', 'co2', 'h2s']);

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

  function getStatistics(paramKey) {
    // Get all valid values (non-zero)
    const values = trendData.map(function(d) { return d[paramKey] || 0; }).filter(v => v !== 0);
    if (values.length === 0) return { avg12hr: 0, avg24hr: 0, min: 0, max: 0 };
    
    // Calculate overall statistics from loaded data
    const sum = values.reduce(function(a, b) { return a + b; }, 0);
    const avg = sum / values.length;
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    
    // For 12hr vs 24hr: If we have enough data points, split them
    // First half represents older data (12-24hr ago), second half represents recent (0-12hr)
    let avg12hr = avg;
    let avg24hr = avg;
    
    if (values.length >= 2) {
      const halfIndex = Math.floor(values.length / 2);
      // Recent 12 hours (second half of data - more recent)
      const recent12hr = values.slice(halfIndex);
      // Full 24 hours (all data)
      const full24hr = values;
      
      if (recent12hr.length > 0) {
        avg12hr = recent12hr.reduce((a, b) => a + b, 0) / recent12hr.length;
      }
      avg24hr = full24hr.reduce((a, b) => a + b, 0) / full24hr.length;
    }
    
    return { avg12hr: avg12hr, avg24hr: avg24hr, min: min, max: max };
  }

  function getFilteredCategories() {
    if (selectedCategory === 'all') {
      return parameterCategories;
    }
    const result = {};
    result[selectedCategory] = parameterCategories[selectedCategory];
    return result;
  }

  const filteredCategories = getFilteredCategories();

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

  function handleDownloadCSV() {
    const headers = ['Time'];
    const paramList = [];
    selectedParams.forEach(function(key) {
      const param = allParameters.find(function(p) { return p.key === key; });
      if (param) {
        headers.push(param.label + ' (' + param.unit + ')');
        paramList.push(key);
      }
    });
    
    const rows = trendData.map(function(d) {
      const row = [d.time];
      paramList.forEach(function(key) {
        row.push((d[key] || 0).toFixed(2));
      });
      return row;
    });
    
    generateCSVDownload({
      title: 'Trends_Data_' + timeRange,
      headers: headers,
      data: rows
    });
    setShowDownloadMenu(false);
  }

  async function handleDownloadPDF() {
    const tableHeaders = ['Time'];
    const paramList = [];
    selectedParams.slice(0, 5).forEach(function(key) {
      const param = allParameters.find(function(p) { return p.key === key; });
      if (param) {
        tableHeaders.push(param.label);
        paramList.push(key);
      }
    });
    
    const tableData = trendData.slice(0, 15).map(function(d) {
      const row = [d.time];
      paramList.forEach(function(key) {
        row.push((d[key] || 0).toFixed(2));
      });
      return row;
    });
    
    await generatePDFReport({
      title: 'Historical Trends Report',
      subtitle: 'LR Energy Biogas Plant - Karnal',
      period: 'Time Range: ' + timeRange,
      summaryData: {
        'Parameters': selectedParams.length.toString(),
        'Time Range': timeRange,
        'Data Points': trendData.length.toString(),
        'Report Type': 'Trends Analysis'
      },
      tableHeaders: tableHeaders,
      tableData: tableData
    });
    setShowDownloadMenu(false);
  }

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

  const timeRangeButtons = ['1h', '12h', '24h', '7d'].map(function(range) {
    return (
      <button
        key={range}
        onClick={function() { setTimeRange(range); }}
        data-testid={'time-range-' + range}
        className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' +
          (timeRange === range
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
      >
        {range}
      </button>
    );
  });

  const chartTypeButtons = ['line', 'area'].map(function(type) {
    return (
      <button
        key={type}
        onClick={function() { setChartType(type); }}
        data-testid={'chart-type-' + type}
        className={'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ' +
          (chartType === type
            ? 'bg-violet-700 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
      >
        {type}
      </button>
    );
  });

  const categoryOptions = [<option key="all" value="all">All Categories</option>];
  Object.keys(parameterCategories).forEach(function(cat) {
    categoryOptions.push(<option key={cat} value={cat}>{cat}</option>);
  });

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
          data-testid={'param-toggle-' + param.key}
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

  const statisticsCards = [];
  selectedParams.slice(0, 12).forEach(function(paramKey) {
    const param = allParameters.find(function(p) { return p.key === paramKey; });
    if (!param) return;
    const stats = getStatistics(paramKey);

    statisticsCards.push(
      <div key={paramKey} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: param.color }}></div>
          <span className="text-xs font-semibold text-slate-700 truncate">{param.label}</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">12-Hr Avg:</span>
            <span className="font-bold font-mono text-slate-800">{stats.avg12hr.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">24-Hr Avg:</span>
            <span className="font-semibold font-mono text-slate-700">{stats.avg24hr.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Min:</span>
            <span className="font-semibold font-mono text-emerald-600">{stats.min.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Max:</span>
            <span className="font-semibold font-mono text-rose-600">{stats.max.toFixed(2)}</span>
          </div>
          <div className="text-xs text-slate-400 pt-1 border-t border-slate-200">{param.unit}</div>
        </div>
      </div>
    );
  });

  const categoryCharts = categoriesToDisplay.map(function(cat) {
    return renderCategoryChart(cat.name, cat.params, false);
  });

  if (loading && trendData.length === 0) {
    return (
      <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="trends-page">
        <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mr-3" />
          <span className="text-slate-500 text-lg">Loading trend data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="trends-page">
      {renderMaximizedModal()}
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-2 flex items-center space-x-3">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <span>Historical Trends Analysis</span>
          </h1>
          <p className="text-slate-600">Analyze historical data patterns and performance metrics across all SCADA parameters</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          {isConnected ? (
            <span className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
              <Wifi className="w-3 h-3" />
              <span>LIVE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              <WifiOff className="w-3 h-3" />
              <span>DEMO</span>
            </span>
          )}

          {/* API Stats */}
          {apiStats && (
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
              {apiStats.totalRecords}/{apiStats.expectedRecords} records ({apiStats.coveragePercent}%)
            </span>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Download Buttons */}
          <div className="relative">
            <button
              onClick={function() { setShowDownloadMenu(!showDownloadMenu); }}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            {showDownloadMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button 
                  onClick={handleDownloadCSV}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                  <span>Download CSV</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center space-x-2 text-slate-700 border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Download PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
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

        {/* Chart Visualization */}
        <div className="lg:col-span-9 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Data Visualization <span className="text-sm font-normal text-slate-500">(Click chart to maximize)</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryCharts}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h4 className="text-lg font-semibold text-slate-700 mb-4">Selected Parameter Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {statisticsCards}
        </div>
      </div>
    </div>
  );
}

export default TrendsPage;
