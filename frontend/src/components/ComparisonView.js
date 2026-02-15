import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, BarChart3, RefreshCw, WifiOff, Wifi, AlertTriangle, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { getComparisonData, formatNumber } from '../services/api';
import { generatePDFReport } from '../utils/pdfUtils';

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
          <div className="text-xs text-slate-500">Today (Current)</div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatNumber(todayValue, title.includes('CH') || title.includes('CO') || title.includes('O₂') ? 1 : 0)}
            <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Yesterday (Avg)</div>
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
  const [isConnected, setIsConnected] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  // Store last known good data
  const lastKnownDataRef = useRef(null);

  // Download comparison data as CSV
  const downloadCSV = () => {
    if (!comparisonData?.metrics) return;
    
    const headers = ['Parameter', 'Unit', 'Category', 'Today', 'Yesterday', 'Change', 'Change %', 'Status'];
    const rows = Object.entries(comparisonData.metrics).map(([key, m]) => [
      m.label,
      m.unit,
      m.category,
      m.current,
      m.previous,
      m.change,
      m.change_percent + '%',
      m.status
    ]);
    
    const csvContent = [
      `Performance Comparison - ${comparisonData.period_label}`,
      `Generated: ${comparisonData.generated_at}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison_${comparisonPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  // Download comparison data as PDF using pdfUtils
  const downloadPDF = async () => {
    if (!comparisonData?.metrics) return;
    
    const summary = comparisonData.summary || {};
    const metrics = comparisonData.metrics || {};
    
    // Prepare table data for PDF
    const tableHeaders = ['Parameter', 'Today', 'Yesterday', 'Change', 'Status'];
    const tableData = Object.entries(metrics).map(([key, m]) => [
      `${m.label} (${m.unit})`,
      String(m.current),
      String(m.previous),
      `${m.change > 0 ? '+' : ''}${m.change} (${m.change_percent > 0 ? '+' : ''}${m.change_percent}%)`,
      m.status.charAt(0).toUpperCase() + m.status.slice(1)
    ]);
    
    // Prepare summary data
    const summaryData = {
      'Improved': summary.improved || 0,
      'Stable': summary.stable || 0,
      'Warning': summary.warning || 0,
      'Declined': summary.declined || 0
    };
    
    const reportData = {
      title: 'Performance Comparison',
      subtitle: comparisonData.period_label || 'Today vs Yesterday',
      period: new Date().toLocaleDateString('en-IN'),
      summaryData: summaryData,
      tableHeaders: tableHeaders,
      tableData: tableData
    };
    
    setShowDownloadMenu(false);
    
    try {
      await generatePDFReport(reportData);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  // Mock data for when API is unavailable (first load only)
  const getMockComparisonData = () => ({
    period: 'today_vs_yesterday',
    period_label: 'Today vs Yesterday (Demo)',
    generated_at: new Date().toISOString(),
    summary: { improved: 5, stable: 3, warning: 1, declined: 0 },
    data_quality: { current_samples: 1380, previous_samples: 1440 },
    metrics: {
      raw_biogas_flow: { label: 'Raw Biogas Flow', unit: 'Nm³/hr', category: 'gas_production', current: 1250.5, previous: 1180.2, change: 70.3, change_percent: 5.9, status: 'improved' },
      purified_gas_flow: { label: 'Purified Gas Flow', unit: 'Nm³/hr', category: 'gas_production', current: 1180.2, previous: 1150.5, change: 29.7, change_percent: 2.6, status: 'improved' },
      product_gas_flow: { label: 'Product Gas Flow', unit: 'Nm³/hr', category: 'gas_production', current: 1150.8, previous: 1140.2, change: 10.6, change_percent: 0.9, status: 'stable' },
      ch4: { label: 'CH₄', unit: '%', category: 'gas_composition', current: 96.8, previous: 96.5, change: 0.3, change_percent: 0.3, status: 'stable' },
      co2: { label: 'CO₂', unit: '%', category: 'gas_composition', current: 2.9, previous: 3.1, change: -0.2, change_percent: -6.5, status: 'improved' },
      o2: { label: 'O₂', unit: '%', category: 'gas_composition', current: 0.3, previous: 0.28, change: 0.02, change_percent: 7.1, status: 'warning' },
      h2s: { label: 'H₂S', unit: 'ppm', category: 'gas_composition', current: 180, previous: 195, change: -15, change_percent: -7.7, status: 'improved' },
      buffer_tank: { label: 'Buffer Tank', unit: '%', category: 'equipment', current: 82, previous: 80, change: 2, change_percent: 2.5, status: 'improved' },
      psa_efficiency: { label: 'PSA Efficiency', unit: '%', category: 'equipment', current: 94.4, previous: 94.2, change: 0.2, change_percent: 0.2, status: 'stable' }
    }
  });

  // Fetch comparison data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getComparisonData(comparisonPeriod);
      
      if (result.success && result.data) {
        // ✅ Valid data received - Connection is LIVE
        setComparisonData(result.data);
        lastKnownDataRef.current = result.data; // Store as last known good data
        setError(null);
        setIsConnected(true);
        setIsDemo(false);
      } else {
        // API call failed
        handleConnectionLost();
      }
    } catch (err) {
      // Network error
      console.error('Comparison API error:', err.message);
      handleConnectionLost();
    } finally {
      setLoading(false);
    }
  }, [comparisonPeriod]);

  // Handle connection lost - KEEP LAST KNOWN DATA
  const handleConnectionLost = () => {
    setIsConnected(false);
    
    if (lastKnownDataRef.current) {
      // ✅ We have last known real data - KEEP SHOWING IT
      setComparisonData({
        ...lastKnownDataRef.current,
        _connectionLost: true
      });
      setError('Connection lost - showing last known data');
      setIsDemo(false);
    } else {
      // ❌ No previous data - show demo
      setComparisonData(getMockComparisonData());
      setError('API not connected - showing demo data');
      setIsDemo(true);
    }
  };

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds (1 minute)
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Get period label
  const getPeriodLabel = () => {
    if (isDemo) return comparisonData?.period_label || 'Today vs Yesterday (Demo)';
    return comparisonData?.period_label || 'Today vs Yesterday';
  };

  // Handle period change
  const handlePeriodChange = (e) => {
    setComparisonPeriod(e.target.value);
  };

  // Connection Status Badge
  const ConnectionBadge = () => {
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
    return null; // Don't show badge when connected (header already shows LIVE)
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
          <ConnectionBadge />
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
          
          {/* Download Menu */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(!showDownloadMenu); }}
              className="flex items-center space-x-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
              title="Download comparison"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            {showDownloadMenu && (
              <div 
                className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={downloadPDF}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                >
                  <FileText className="w-4 h-4 mr-2 text-red-500" />
                  Download PDF
                </button>
                <button 
                  onClick={downloadCSV}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-b-lg"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-500" />
                  Download CSV
                </button>
              </div>
            )}
          </div>
          
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
          {/* Warning Banner for Connection Issues */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center ${
              isDemo ? 'bg-amber-50 border border-amber-200' : 'bg-orange-50 border border-orange-200'
            }`}>
              <AlertTriangle className={`w-4 h-4 mr-2 ${isDemo ? 'text-amber-500' : 'text-orange-500'}`} />
              <span className={`text-sm ${isDemo ? 'text-amber-700' : 'text-orange-700'}`}>
                {error}
              </span>
            </div>
          )}
          
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
