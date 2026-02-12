import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Eye, X, Maximize2, Download, FileText, FileSpreadsheet, RefreshCw, WifiOff, Wifi, AlertTriangle } from 'lucide-react';
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
  const [error, setError] = useState(null);
  const [dataStats, setDataStats] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  
  // Store last known good data
  const lastKnownDataRef = useRef(null);
  const lastKnownStatsRef = useRef(null);

  // Transform API data to chart format
  const transformApiData = (apiData) => {
    return (apiData || []).map((row, index) => ({
      time: row.timestamp ? new Date(row.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : `${index}`,
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
      psaEfficiency: parseFloat(row.psa_efficiency) || 0,
      ltPanelPower: parseFloat(row.lt_panel_power) || 0
    }));
  };

  // Fetch trends data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const hours = timeRange === '1h' ? 1 : timeRange === '12h' ? 12 : timeRange === '24h' ? 24 : 168;
      const result = await getTrendsData(hours);
      
      if (result.success && result.data?.data) {
        // ✅ Valid data received - Connection is LIVE
        const transformedData = transformApiData(result.data.data);
        const stats = {
          dataPoints: result.data.data_points,
          totalRecords: result.data.total_records,
          expectedRecords: result.data.expected_records,
          coveragePercent: result.data.coverage_percent,
          intervalMinutes: result.data.query?.interval_minutes
        };
        
        setTrendData(transformedData);
        setDataStats(stats);
        
        // Store as last known good data
        lastKnownDataRef.current = transformedData;
        lastKnownStatsRef.current = stats;
        
        setError(null);
        setIsConnected(true);
        setIsDemo(false);
      } else {
        // API call failed
        handleConnectionLost(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      // Network error
      console.error('Trends API error:', err.message);
      handleConnectionLost(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Handle connection lost - KEEP LAST KNOWN DATA
  const handleConnectionLost = (errorMsg) => {
    setIsConnected(false);
    
    if (lastKnownDataRef.current && lastKnownDataRef.current.length > 0) {
      // ✅ We have last known real data - KEEP SHOWING IT
      setTrendData(lastKnownDataRef.current);
      setDataStats(lastKnownStatsRef.current);
      setError('Connection lost - showing last known data');
      setIsDemo(false);
    } else {
      // ❌ No previous data - show demo
      setTrendData(generateMockData(timeRange));
      setDataStats(null);
      setError('API not connected - showing demo data');
      setIsDemo(true);
    }
  };

  // Generate mock data as fallback
  function generateMockData(range) {
    const hours = range === '1h' ? 60 : range === '12h' ? 12 : range === '24h' ? 24 : 168;
    const data = [];
    for (let i = 0; i < hours; i++) {
      data.push({
        time: `${i}h`,
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
        bufferTank: 82 + (Math.random() * 6 - 3),
        lagoonTank: 76 + (Math.random() * 6 - 3)
      });
    }
    return data;
  }

  // Fetch on mount and when time range changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds (1 minute)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds
    
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
      setSelectedParams([...selectedParams, ...categoryParams.filter(function(k) { return !selectedParams.includes(k); })]);
    }
  }

  function renderChart(category, params, height = 300) {
    const ChartComponent = chartType === 'line' ? LineChart : AreaChart;
    const DataComponent = chartType === 'line' ? Line : Area;

    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm" key={category}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-700">{category}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setMaximizedChart(category)} 
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
              title="Maximize"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }} 
              stroke="#94a3b8"
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend />
            {params.map(param => (
              <DataComponent
                key={param.key}
                type="monotone"
                dataKey={param.key}
                name={param.label}
                stroke={param.color}
                fill={chartType === 'area' ? param.color : undefined}
                fillOpacity={chartType === 'area' ? 0.1 : undefined}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  }

  // Loading state
  if (loading && trendData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trends & Analytics</h1>
            <p className="text-slate-500 mt-1">Historical data visualization and analysis</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mr-3" />
          <span className="text-slate-500 text-lg">Loading trend data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trends & Analytics</h1>
          <p className="text-slate-500 mt-1">Historical data visualization and analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Connection Status Badge */}
          {isDemo ? (
            <span className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              <WifiOff className="w-3 h-3" />
              <span>DEMO</span>
            </span>
          ) : !isConnected && error ? (
            <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
              <WifiOff className="w-3 h-3" />
              <span>OFFLINE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
              <Wifi className="w-3 h-3" />
              <span>LIVE</span>
            </span>
          )}
          
          {/* Data Coverage Badge */}
          {dataStats && (
            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
              {dataStats.totalRecords}/{dataStats.expectedRecords} records ({dataStats.coveragePercent}%)
            </div>
          )}
          
          {/* Refresh Button */}
          <button 
            onClick={fetchData}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {/* Download Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <button 
                  onClick={() => { generatePDFReport(trendData, selectedParams, timeRange); setShowDownloadMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
                <button 
                  onClick={() => { generateCSVDownload(trendData, selectedParams); setShowDownloadMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status & Error Banner */}
      {error && (
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          isDemo ? 'bg-amber-50 border border-amber-200' : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`w-5 h-5 mr-2 ${isDemo ? 'text-amber-500' : 'text-orange-500'}`} />
            <div>
              <span className={`font-medium ${isDemo ? 'text-amber-700' : 'text-orange-700'}`}>
                {isDemo ? 'Demo Mode' : 'Connection Lost'}
              </span>
              <span className={`text-sm ml-2 ${isDemo ? 'text-amber-600' : 'text-orange-600'}`}>
                {isDemo ? '- Showing sample data. Connect to API for live data.' : '- Showing last known data. Attempting to reconnect...'}
              </span>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className={`px-3 py-1 text-sm font-medium rounded ${
              isDemo ? 'bg-amber-200 text-amber-800 hover:bg-amber-300' : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
            }`}
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Time Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Time Range:</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {['1h', '12h', '24h', '7d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    timeRange === range 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Type */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Chart:</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              {['area', 'line'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    chartType === type 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Parameter Selection */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Parameters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(parameterCategories).map(([category, params]) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  params.every(p => selectedParams.includes(p.key))
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(parameterCategories).map(([category, params]) => {
          const activeParams = params.filter(p => selectedParams.includes(p.key));
          if (activeParams.length === 0) return null;
          return renderChart(category, activeParams);
        })}
      </div>

      {/* Maximized Chart Modal */}
      {maximizedChart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">{maximizedChart}</h3>
              <button 
                onClick={() => setMaximizedChart(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {renderChart(
                maximizedChart, 
                parameterCategories[maximizedChart]?.filter(p => selectedParams.includes(p.key)) || [],
                500
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrendsPage;
