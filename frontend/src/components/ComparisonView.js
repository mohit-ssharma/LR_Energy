import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, BarChart3, Calendar, RefreshCw, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getComparisonData, formatNumber } from '../services/api';

// Comparison Card Component
const ComparisonCard = ({ title, unit, todayValue, yesterdayValue, goodDirection, status, changePercent }) => {
  let statusColor, statusBg, statusIcon;
  
  switch (status) {
    case 'improved':
      statusColor = 'text-emerald-700';
      statusBg = 'bg-emerald-50 border-emerald-200';
      statusIcon = goodDirection === 'lower' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
      break;
    case 'declined':
      statusColor = 'text-rose-700';
      statusBg = 'bg-rose-50 border-rose-200';
      statusIcon = goodDirection === 'lower' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
      break;
    case 'warning':
      statusColor = 'text-amber-700';
      statusBg = 'bg-amber-50 border-amber-200';
      statusIcon = changePercent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
      break;
    default:
      statusColor = 'text-blue-700';
      statusBg = 'bg-blue-50 border-blue-200';
      statusIcon = <Minus className="w-4 h-4" />;
  }

  return (
    <div className={`p-4 rounded-lg border ${statusBg}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <span className={`flex items-center space-x-1 text-xs font-semibold ${statusColor}`}>
          {statusIcon}
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500">Today</div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatNumber(todayValue, title.includes('CH') || title.includes('CO') || title.includes('O₂') ? 1 : 0)}
            <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Yesterday</div>
          <div className="text-xl font-bold font-mono text-slate-500">
            {formatNumber(yesterdayValue, title.includes('CH') || title.includes('CO') || title.includes('O₂') ? 1 : 0)}
            <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex items-center">
        <span className={`text-sm font-mono ${statusColor}`}>
          {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400 ml-2">
          ({changePercent > 0 ? '+' : ''}{formatNumber(todayValue - yesterdayValue, 1)} {unit})
        </span>
      </div>
    </div>
  );
};

// Summary Badge Component
const SummaryBadge = ({ count, label, color }) => (
  <div className={`px-4 py-2 rounded-lg ${color} text-center`}>
    <div className="text-2xl font-bold">{count}</div>
    <div className="text-xs font-medium">{label}</div>
  </div>
);

const ComparisonView = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [comparisonPeriod, setComparisonPeriod] = useState('today_vs_yesterday');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comparison data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getComparisonData(comparisonPeriod);
      
      if (result.success) {
        setComparisonData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [comparisonPeriod]);

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Get period label
  const getPeriodLabel = () => {
    return comparisonData?.period_label || 'Today vs Yesterday';
  };

  // Handle period change
  const handlePeriodChange = (e) => {
    setComparisonPeriod(e.target.value);
  };

  // Loading state
  if (loading && !comparisonData) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6" data-testid="comparison-view">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Performance Comparison</span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mr-2" />
          <span className="text-slate-500">Loading comparison data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !comparisonData) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6" data-testid="comparison-view">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Performance Comparison</span>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 bg-red-50">
          <WifiOff className="w-6 h-6 text-red-400 mr-2" />
          <span className="text-red-600">Failed to load comparison data</span>
          <button 
            onClick={fetchData}
            className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const summary = comparisonData?.summary || { improved: 0, stable: 0, warning: 0, declined: 0 };
  const metrics = comparisonData?.metrics || {};

  // Group metrics by category
  const gasProduction = Object.entries(metrics).filter(([_, m]) => m.category === 'gas_production');
  const gasComposition = Object.entries(metrics).filter(([_, m]) => m.category === 'gas_composition');
  const equipment = Object.entries(metrics).filter(([_, m]) => m.category === 'equipment');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6" data-testid="comparison-view">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5" />
          <span className="font-semibold">Performance Comparison</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{getPeriodLabel()}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={comparisonPeriod}
            onChange={handlePeriodChange}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="today_vs_yesterday">Today vs Yesterday</option>
            <option value="this_week_vs_last">This Week vs Last Week</option>
            <option value="this_month_vs_last">This Month vs Last Month</option>
          </select>
          
          <button 
            onClick={(e) => { e.stopPropagation(); fetchData(); }}
            className="p-1 hover:bg-white/20 rounded"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          {/* Summary Badges */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SummaryBadge 
              count={summary.improved} 
              label="Improved" 
              color="bg-emerald-100 text-emerald-700"
            />
            <SummaryBadge 
              count={summary.stable} 
              label="Stable" 
              color="bg-blue-100 text-blue-700"
            />
            <SummaryBadge 
              count={summary.warning} 
              label="Warning" 
              color="bg-amber-100 text-amber-700"
            />
            <SummaryBadge 
              count={summary.declined} 
              label="Declined" 
              color="bg-rose-100 text-rose-700"
            />
          </div>

          {/* Gas Production Section */}
          {gasProduction.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Gas Production</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gasProduction.map(([key, metric]) => (
                  <ComparisonCard
                    key={key}
                    title={metric.label}
                    unit={metric.unit}
                    todayValue={metric.current}
                    yesterdayValue={metric.previous}
                    goodDirection="higher"
                    status={metric.status}
                    changePercent={metric.change_percent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Gas Composition Section */}
          {gasComposition.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Gas Composition</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {gasComposition.map(([key, metric]) => {
                  const goodDirection = ['co2', 'o2', 'h2s'].includes(key) ? 'lower' : 'higher';
                  return (
                    <ComparisonCard
                      key={key}
                      title={metric.label}
                      unit={metric.unit}
                      todayValue={metric.current}
                      yesterdayValue={metric.previous}
                      goodDirection={goodDirection}
                      status={metric.status}
                      changePercent={metric.change_percent}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Equipment & Storage Section */}
          {equipment.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Equipment & Storage</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {equipment.map(([key, metric]) => {
                  const goodDirection = ['buffer_tank', 'lagoon_tank'].includes(key) ? 'stable' : 'higher';
                  return (
                    <ComparisonCard
                      key={key}
                      title={metric.label}
                      unit={metric.unit}
                      todayValue={metric.current}
                      yesterdayValue={metric.previous}
                      goodDirection={goodDirection}
                      status={metric.status}
                      changePercent={metric.change_percent}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Data Quality Info */}
          {comparisonData?.data_quality && (
            <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Data samples: Today ({comparisonData.data_quality.current_samples || 0}) | 
                  Yesterday ({comparisonData.data_quality.previous_samples || 0})
                </span>
                <span>Generated: {comparisonData.generated_at}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
