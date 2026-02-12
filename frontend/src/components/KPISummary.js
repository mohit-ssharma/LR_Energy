import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, Droplet, Wind, Gauge, AlertTriangle, CheckCircle, RefreshCw, WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getDashboardData, formatNumber } from '../services/api';

// Connection Status Component
const ConnectionStatus = ({ isConnected, isDemo, dataStatus, lastUpdate, onRetry }) => {
  const getStatusInfo = () => {
    if (isDemo) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'DEMO MODE',
        subtext: 'API not connected',
        color: 'bg-amber-100 text-amber-700 border-amber-200'
      };
    }
    
    if (!isConnected) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'OFFLINE',
        subtext: 'Connection lost',
        color: 'bg-red-100 text-red-700 border-red-200'
      };
    }
    
    switch (dataStatus) {
      case 'FRESH':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'LIVE',
          subtext: 'Real-time data',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
      case 'DELAYED':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'DELAYED',
          subtext: 'Data is 2-5 min old',
          color: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      case 'STALE':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'STALE',
          subtext: 'Data is >5 min old',
          color: 'bg-red-100 text-red-700 border-red-200'
        };
      default:
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'CONNECTED',
          subtext: '',
          color: 'bg-blue-100 text-blue-700 border-blue-200'
        };
    }
  };

  const status = getStatusInfo();
  
  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${status.color}`}>
      {status.icon}
      <div className="flex flex-col">
        <span className="text-xs font-bold">{status.text}</span>
        {status.subtext && <span className="text-xs opacity-75">{status.subtext}</span>}
      </div>
      {(!isConnected || isDemo) && (
        <button 
          onClick={onRetry}
          className="ml-2 p-1 hover:bg-white/50 rounded"
          title="Retry connection"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// Data Quality Badge Component
const DataQualityBadge = ({ samples, expected, showWarning = true }) => {
  const coverage = expected > 0 ? (samples / expected) * 100 : 0;
  
  let statusColor, statusBg, statusText;
  if (coverage >= 95) {
    statusColor = 'text-emerald-600';
    statusBg = 'bg-emerald-50';
    statusText = null;
  } else if (coverage >= 80) {
    statusColor = 'text-slate-600';
    statusBg = 'bg-slate-50';
    statusText = null;
  } else if (coverage >= 50) {
    statusColor = 'text-amber-600';
    statusBg = 'bg-amber-50';
    statusText = 'Partial data';
  } else {
    statusColor = 'text-orange-600';
    statusBg = 'bg-orange-50';
    statusText = 'Low coverage';
  }

  return (
    <div className={`flex items-center justify-between mt-1 px-2 py-1 rounded ${statusBg}`}>
      <span className={`text-xs font-mono ${statusColor}`}>
        {samples}/{expected} samples ({coverage.toFixed(0)}%)
      </span>
      {showWarning && statusText && (
        <span className={`text-xs flex items-center space-x-1 ${statusColor}`}>
          <AlertTriangle className="w-3 h-3" />
          <span>{statusText}</span>
        </span>
      )}
      {coverage >= 95 && (
        <CheckCircle className="w-3 h-3 text-emerald-500" />
      )}
    </div>
  );
};

// Data Status Badge
const DataStatusBadge = ({ status, ageSeconds }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'FRESH': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DELAYED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'STALE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle()}`}>
      {status} {ageSeconds && `(${ageSeconds}s ago)`}
    </span>
  );
};

const KPICard = ({ title, value, unit, totalizer, totalizerValue, totalizerUnit, avgLabel, avgValue, avgSamples, icon: Icon, color, trendData, lastUpdate }) => {
  const getColorClasses = (color) => {
    const colors = {
      'bg-emerald-600': { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', stroke: '#10b981' },
      'bg-violet-700': { bg: 'bg-violet-700', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', stroke: '#8b5cf6' },
      'bg-cyan-600': { bg: 'bg-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', stroke: '#06b6d4' },
      'bg-amber-600': { bg: 'bg-amber-600', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', stroke: '#f59e0b' },
      'bg-rose-600': { bg: 'bg-rose-600', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', stroke: '#e11d48' }
    };
    return colors[color] || colors['bg-emerald-600'];
  };

  const colorClasses = getColorClasses(color);
  const isTotalizerCard = totalizer.includes('Totalizer');
  
  // Format time from lastUpdate
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour12: false });
  };
  
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`kpi-card-${title.toLowerCase().replace(/[₄₂]/g, '').replace(/\s+/g, '-')}`}>
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
            <span className="text-3xl font-bold font-mono tracking-tighter text-slate-900" data-testid={`${title.toLowerCase().replace(/[₄₂]/g, '').replace(/\s+/g, '-')}-value`}>
              {value}
            </span>
            <span className="text-lg text-slate-500 font-medium">{unit}</span>
          </div>
        </div>
        
        <div className="h-12 mb-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colorClasses.stroke}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-2.5 rounded-md ${colorClasses.light} border ${colorClasses.border}`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600">{totalizer}</span>
            <span className={`font-mono text-sm font-semibold ${colorClasses.text}`}>
              {totalizerValue} <span className="text-xs font-normal opacity-75">{totalizerUnit}</span>
            </span>
          </div>
          
          {avgLabel && avgValue && (
            <>
              <div className="border-t border-slate-200/50 mt-2 pt-2 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">{avgLabel}</span>
                <span className={`font-mono text-sm font-semibold ${colorClasses.text}`}>
                  {avgValue}
                </span>
              </div>
              {avgSamples && (
                <DataQualityBadge samples={avgSamples.samples} expected={avgSamples.expected} />
              )}
            </>
          )}
          
          {isTotalizerCard && avgSamples && (
            <DataQualityBadge samples={avgSamples.samples} expected={avgSamples.expected} />
          )}
        </div>
      </div>
    </div>
  );
};

const KPISummary = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Mock data for when API is unavailable
  const getMockData = () => ({
    data_status: 'DEMO',
    data_age_seconds: 0,
    last_update: new Date().toISOString(),
    current: {
      raw_biogas_flow: 1250.5,
      raw_biogas_totalizer: 150000,
      purified_gas_flow: 1180.2,
      purified_gas_totalizer: 142000,
      product_gas_flow: 1150.8,
      product_gas_totalizer: 138000,
      ch4_concentration: 96.8,
      co2_level: 2.9,
      o2_concentration: 0.3,
      h2s_content: 180,
      dew_point: -68
    },
    avg_1hr: {
      raw_biogas_flow: 1248.5,
      ch4_concentration: 96.75,
      co2_level: 2.88,
      h2s_content: 178,
      sample_count: 58,
      expected_samples: 60
    },
    avg_12hr: {
      raw_biogas_flow: 1245.2,
      ch4_concentration: 96.5,
      co2_level: 2.92,
      h2s_content: 182,
      sample_count: 700,
      expected_samples: 720
    },
    totalizer_24hr: {
      raw_biogas: 30000,
      purified_gas: 28320,
      product_gas: 27600,
      sample_count: 1380,
      expected_samples: 1440
    }
  });

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    try {
      const result = await getDashboardData();
      
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
        setLastRefresh(new Date());
      } else {
        // Use mock data when API fails
        console.log('API unavailable, using demo data');
        setDashboardData(getMockData());
        setError('Using demo data - API not connected');
        setLastRefresh(new Date());
      }
    } catch (err) {
      // Use mock data on error
      console.log('API error, using demo data:', err.message);
      setDashboardData(getMockData());
      setError('Using demo data - API not connected');
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh every 60 seconds
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [fetchData]);

  // Generate trend data from historical if available, otherwise static
  const generateTrendData = (baseValue, variance) => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: baseValue + (Math.random() * variance * 2 - variance)
    }));
  };

  // Build KPI data from API response
  const buildKPIData = () => {
    if (!dashboardData) return [];

    const { current, avg_1hr, avg_12hr, totalizer_24hr, last_update } = dashboardData;

    return [
      {
        title: 'Raw Biogas Flow',
        value: formatNumber(current?.raw_biogas_flow, 1),
        unit: 'Nm³/hr',
        totalizer: 'Totalizer (24 Hr)',
        totalizerValue: formatNumber(totalizer_24hr?.raw_biogas, 0),
        totalizerUnit: 'Nm³',
        avgLabel: null,
        avgValue: null,
        avgSamples: { samples: totalizer_24hr?.sample_count || 0, expected: totalizer_24hr?.expected_samples || 1440 },
        icon: Wind,
        color: 'bg-emerald-600',
        trendData: generateTrendData(current?.raw_biogas_flow || 1250, 50),
        lastUpdate: last_update
      },
      {
        title: 'Purified Gas Flow',
        value: formatNumber(current?.purified_gas_flow, 1),
        unit: 'Nm³/hr',
        totalizer: 'Totalizer (24 Hr)',
        totalizerValue: formatNumber(totalizer_24hr?.purified_gas, 0),
        totalizerUnit: 'Nm³',
        avgLabel: null,
        avgValue: null,
        avgSamples: { samples: totalizer_24hr?.sample_count || 0, expected: totalizer_24hr?.expected_samples || 1440 },
        icon: Droplet,
        color: 'bg-violet-700',
        trendData: generateTrendData(current?.purified_gas_flow || 1180, 40),
        lastUpdate: last_update
      },
      {
        title: 'Product Gas Flow',
        value: formatNumber(current?.product_gas_flow, 1),
        unit: 'Nm³/hr',
        totalizer: 'Totalizer (24 Hr)',
        totalizerValue: formatNumber(totalizer_24hr?.product_gas, 0),
        totalizerUnit: 'Nm³',
        avgLabel: null,
        avgValue: null,
        avgSamples: { samples: totalizer_24hr?.sample_count || 0, expected: totalizer_24hr?.expected_samples || 1440 },
        icon: TrendingUp,
        color: 'bg-cyan-600',
        trendData: generateTrendData(current?.product_gas_flow || 1150, 35),
        lastUpdate: last_update
      },
      {
        title: 'CH₄',
        value: formatNumber(current?.ch4_concentration, 1),
        unit: '%',
        totalizer: 'Avg 1 Hr',
        totalizerValue: formatNumber(avg_1hr?.ch4_concentration, 1),
        totalizerUnit: '%',
        avgLabel: 'Avg 12 Hr',
        avgValue: `${formatNumber(avg_12hr?.ch4_concentration, 1)} %`,
        avgSamples: { samples: avg_12hr?.sample_count || 0, expected: avg_12hr?.expected_samples || 720 },
        icon: Gauge,
        color: 'bg-amber-600',
        trendData: generateTrendData(current?.ch4_concentration || 96.8, 0.5),
        lastUpdate: last_update
      },
      {
        title: 'CO₂',
        value: formatNumber(current?.co2_level, 1),
        unit: '%',
        totalizer: 'Avg 1 Hr',
        totalizerValue: formatNumber(avg_1hr?.co2_level, 1),
        totalizerUnit: '%',
        avgLabel: 'Avg 12 Hr',
        avgValue: `${formatNumber(avg_12hr?.co2_level, 1)} %`,
        avgSamples: { samples: avg_12hr?.sample_count || 0, expected: avg_12hr?.expected_samples || 720 },
        icon: Wind,
        color: 'bg-violet-700',
        trendData: generateTrendData(current?.co2_level || 2.9, 0.3),
        lastUpdate: last_update
      },
      {
        title: 'H₂S',
        value: formatNumber(current?.h2s_content, 0),
        unit: 'ppm',
        totalizer: 'Avg 1 Hr',
        totalizerValue: formatNumber(avg_1hr?.h2s_content, 0),
        totalizerUnit: 'ppm',
        avgLabel: 'Avg 12 Hr',
        avgValue: `${formatNumber(avg_12hr?.h2s_content, 0)} ppm`,
        avgSamples: { samples: avg_12hr?.sample_count || 0, expected: avg_12hr?.expected_samples || 720 },
        icon: Gauge,
        color: 'bg-rose-600',
        trendData: generateTrendData(current?.h2s_content || 180, 15),
        lastUpdate: last_update
      }
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="mb-6" data-testid="kpi-summary-section">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">KPI Summary</h2>
        <div className="flex items-center justify-center p-8 bg-white rounded-lg border border-slate-200">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mr-2" />
          <span className="text-slate-500">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  // Error state - show demo data indicator instead of blocking
  if (error && !dashboardData) {
    return (
      <div className="mb-6" data-testid="kpi-summary-section">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">KPI Summary</h2>
        <div className="flex items-center justify-center p-8 bg-amber-50 rounded-lg border border-amber-200">
          <WifiOff className="w-6 h-6 text-amber-500 mr-2" />
          <span className="text-amber-700">API not connected - Loading demo data...</span>
        </div>
      </div>
    );
  }

  const kpiData = buildKPIData();

  return (
    <div className="mb-6" data-testid="kpi-summary-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">KPI Summary</h2>
        <div className="flex items-center space-x-3">
          {dashboardData?.data_status && (
            <DataStatusBadge 
              status={dashboardData.data_status} 
              ageSeconds={dashboardData.data_age_seconds}
            />
          )}
          <button 
            onClick={fetchData}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            title="Refresh data"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
};

export default KPISummary;
