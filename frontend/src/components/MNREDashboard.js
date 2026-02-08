import React from 'react';
import { TrendingUp, Droplet, Wind, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// Data Quality Badge Component for MNRE
const DataQualityBadge = ({ samples, expected }) => {
  const coverage = (samples / expected) * 100;
  
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
      {statusText && (
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

// KPI Card Component for MNRE - Without "Change" attribute
const MNREKPICard = ({ title, value, unit, totalizer, totalizerValue, totalizerUnit, samples, expected, icon: Icon, color, trendData }) => {
  const getColorClasses = (color) => {
    const colors = {
      'bg-emerald-600': { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', stroke: '#10b981' },
      'bg-violet-700': { bg: 'bg-violet-700', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', stroke: '#8b5cf6' },
      'bg-cyan-600': { bg: 'bg-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', stroke: '#06b6d4' }
    };
    return colors[color] || colors['bg-emerald-600'];
  };

  const colorClasses = getColorClasses(color);
  
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`mnre-kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md ${colorClasses.bg}`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">08:43:41</span>
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

        {/* Totalizer box - NO Change attribute, WITH sample count */}
        <div className={`${colorClasses.light} rounded-md p-3 border ${colorClasses.border}`}>
          <div className="text-xs text-slate-500 mb-1">{totalizer}</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-slate-900">{totalizerValue}</span>
            {totalizerUnit && <span className="text-xs text-slate-500">{totalizerUnit}</span>}
          </div>
          {/* Show sample count for data quality transparency */}
          <DataQualityBadge samples={samples} expected={expected} />
        </div>
      </div>
    </div>
  );
};

// MNRE KPI Summary - Only shows Raw Biogas, Purified Gas, Product Gas flows (NO Gas Composition)
const MNREKPISummary = () => {
  const generateTrendData = (baseValue) => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: baseValue + Math.random() * 100 - 50
    }));
  };

  // Only the 3 gas flow KPIs for MNRE with updated values and sample counts
  const kpiData = [
    {
      title: 'Raw Biogas Flow',
      value: '1250',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer (24 Hr)',
      totalizerValue: '30,000',
      totalizerUnit: 'Nm³',
      samples: 1380,
      expected: 1440, // 24 hrs * 60 min = 1440
      icon: Wind,
      color: 'bg-emerald-600',
      trendData: generateTrendData(1250)
    },
    {
      title: 'Purified Gas Flow',
      value: '1180',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer (24 Hr)',
      totalizerValue: '28,320',
      totalizerUnit: 'Nm³',
      samples: 1400,
      expected: 1440,
      icon: Droplet,
      color: 'bg-violet-700',
      trendData: generateTrendData(1180)
    },
    {
      title: 'Product Gas Flow',
      value: '1150',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer (24 Hr)',
      totalizerValue: '27,600',
      totalizerUnit: 'Nm³',
      samples: 1420,
      expected: 1440,
      icon: TrendingUp,
      color: 'bg-cyan-600',
      trendData: generateTrendData(1150)
    }
  ];

  return (
    <div className="mb-6" data-testid="mnre-kpi-summary-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Gas Flow Summary</h2>
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
  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="mnre-dashboard-page">
      <MNREKPISummary />
      {/* Gas Composition Section REMOVED as per requirement */}
    </div>
  );
};

export default MNREDashboard;
