import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, Droplet, Wind, RefreshCw, WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getDashboardData, formatNumber } from '../services/api';

// Connection Status Badge Component
const ConnectionBadge = ({ isConnected, isDemo }) => {
  if (isDemo) {
    return (
      <span className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
        <WifiOff className="w-3 h-3" />
        <span>DEMO</span>
      </span>
    );
  }
  if (!isConnected) {
    return (
      <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
        <WifiOff className="w-3 h-3" />
        <span>OFFLINE</span>
      </span>
    );
  }
  return (
    <span className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
      <Wifi className="w-3 h-3" />
      <span>LIVE</span>
    </span>
  );
};

// KPI Card Component for MNRE - Without "Change" attribute, WITHOUT sample counts
const MNREKPICard = ({ title, value, unit, totalizer, totalizerValue, totalizerUnit, icon: Icon, color, trendData, lastUpdate }) => {
  const getColorClasses = (color) => {
    const colors = {
      'bg-emerald-600': { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', stroke: '#10b981' },
      'bg-violet-700': { bg: 'bg-violet-700', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', stroke: '#8b5cf6' },
      'bg-cyan-600': { bg: 'bg-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', stroke: '#06b6d4' }
    };
    return colors[color] || colors['bg-emerald-600'];
  };

  const colorClasses = getColorClasses(color);
  
  // Format time from lastUpdate - show Date + Time always
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    // Always show Date + Time format: "19 Feb 14:30"
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`mnre-kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md ${colorClasses.bg}`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">{formatTime(lastUpdate)}</span>
      </div>

      <div className="p-4 bg-gradient-to-br from-slate-50/20 to-white">
        <div className="mb-3">
          <div className="text-xs text-slate-500 mb-1">Current Value</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono tracking-tighter text-slate-900" data-testid={`mnre-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
              {value}
            </span>
            <span className="text-sm font-medium text-slate-400">{unit}</span>
          </div>
        </div>

        <div className="h-12 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colorClasses.stroke}
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Totalizer box - NO Change attribute, NO sample counts */}
        <div className={`${colorClasses.light} rounded-md p-3 border ${colorClasses.border}`}>
          <div className="text-xs text-slate-500 mb-1">{totalizer}</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-slate-900">{totalizerValue}</span>
            {totalizerUnit && <span className="text-xs text-slate-500">{totalizerUnit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// MNRE KPI Summary - Only shows Raw Biogas, Purified Gas, Product Gas flows (NO Gas Composition)
const MNREKPISummary = ({ dashboardData, loading, error, isConnected, isDemo, onRefresh }) => {
  // Generate trend data from base value
  const generateTrendData = (baseValue, variance = 50) => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: (baseValue || 0) + Math.random() * variance * 2 - variance
    }));
  };

  // Build KPI data from API response
  const buildKPIData = () => {
    if (!dashboardData) return [];

    const { current, last_update } = dashboardData;

    return [
      {
        title: 'Raw Biogas Flow',
        value: formatNumber(current?.raw_biogas_flow, 1),
        unit: 'Nm³/hr',
        totalizer: 'Totalizer',
        totalizerValue: formatNumber(current?.raw_biogas_totalizer || 0, 2),
        totalizerUnit: 'Nm³',
        icon: Wind,
        color: 'bg-emerald-600',
        trendData: generateTrendData(current?.raw_biogas_flow || 1250),
        lastUpdate: last_update
      },
      {
        title: 'Purified Gas Flow',
        value: formatNumber(current?.purified_gas_flow, 1),
        unit: 'Nm³/hr',
        totalizer: 'Totalizer',
        totalizerValue: formatNumber(current?.purified_gas_totalizer || 0, 2),
        totalizerUnit: 'Nm³',
        icon: Droplet,
        color: 'bg-violet-700',
        trendData: generateTrendData(current?.purified_gas_flow || 1180),
        lastUpdate: last_update
      },
      {
        title: 'Product Gas Flow',
        value: formatNumber(current?.product_gas_flow, 1),
        unit: 'Kg/hr',
        totalizer: 'Totalizer',
        totalizerValue: formatNumber(current?.product_gas_totalizer || 0, 2),
        totalizerUnit: 'Kg',
        icon: TrendingUp,
        color: 'bg-cyan-600',
        trendData: generateTrendData(current?.product_gas_flow || 1150),
        lastUpdate: last_update
      }
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="mb-6" data-testid="mnre-kpi-summary-section">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Gas Flow Summary</h2>
        <div className="flex items-center justify-center p-8 bg-white rounded-lg border border-slate-200">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mr-2" />
          <span className="text-slate-500">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  const kpiData = buildKPIData();

  return (
    <div className="mb-6" data-testid="mnre-kpi-summary-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">Gas Flow Summary</h2>
        <div className="flex items-center space-x-2">
          <ConnectionBadge isConnected={isConnected} isDemo={isDemo} />
          <button 
            onClick={onRefresh}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="Refresh data"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Warning Banner for Connection Issues */}
      {error && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          isDemo ? 'bg-amber-50 border border-amber-200' : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`w-5 h-5 mr-2 ${isDemo ? 'text-amber-500' : 'text-orange-500'}`} />
            <div>
              <span className={`font-medium ${isDemo ? 'text-amber-700' : 'text-orange-700'}`}>
                {isDemo ? 'Demo Mode' : 'Connection Lost'}
              </span>
              <span className={`text-sm ml-2 ${isDemo ? 'text-amber-600' : 'text-orange-600'}`}>
                {isDemo 
                  ? '- Showing sample data. Connect to API for live data.' 
                  : '- Showing last known data. Attempting to reconnect...'}
              </span>
            </div>
          </div>
          <button 
            onClick={onRefresh}
            className={`px-3 py-1 text-sm font-medium rounded ${
              isDemo ? 'bg-amber-200 text-amber-800 hover:bg-amber-300' : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
            }`}
          >
            Retry Now
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi, index) => (
          <MNREKPICard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
};

// Main MNRE Dashboard Component - NO Gas Composition Section
const MNREDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  
  // Store last known good data
  const lastKnownDataRef = useRef(null);

  // Fetch dashboard data with connection tracking
  const fetchData = useCallback(async () => {
    try {
      const result = await getDashboardData();
      
      if (result.success && result.data) {
        // Check if data is valid
        if (result.data.current && result.data.current.raw_biogas_flow !== undefined) {
          // ✅ Valid data received - Connection is LIVE
          setDashboardData(result.data);
          lastKnownDataRef.current = result.data; // Store as last known good data
          setError(null);
          setIsConnected(true);
          setIsDemo(false);
        } else {
          // API returned but data is empty/invalid
          handleConnectionLost('Server returned empty data');
        }
      } else {
        // API call failed
        handleConnectionLost(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      // Network error
      console.error('MNRE Dashboard API error:', err.message);
      handleConnectionLost(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle connection lost - KEEP LAST KNOWN DATA (not mock)
  const handleConnectionLost = (errorMsg) => {
    setIsConnected(false);
    
    if (lastKnownDataRef.current) {
      // ✅ We have last known real data - KEEP SHOWING IT
      setDashboardData({
        ...lastKnownDataRef.current,
        data_status: 'OFFLINE',
        _connectionLost: true,
        _lastKnownTime: lastKnownDataRef.current.last_update
      });
      setError('Connection lost - showing last known data');
      setIsDemo(false);
    } else {
      // ❌ No previous data - show empty state (NO MOCK DATA)
      setDashboardData(null);
      setError('No data available - connect to database');
      setIsDemo(false);
    }
  };

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds for faster updates
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="mnre-dashboard-page">
      <MNREKPISummary 
        dashboardData={dashboardData}
        loading={loading}
        error={error}
        isConnected={isConnected}
        isDemo={isDemo}
        onRefresh={fetchData}
      />
      {/* Gas Composition Section REMOVED as per requirement */}
    </div>
  );
};

export default MNREDashboard;
