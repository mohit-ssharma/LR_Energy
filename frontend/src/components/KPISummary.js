import React from 'react';
import { TrendingUp, Droplet, Wind, Gauge } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const KPICard = ({ title, value, unit, totalizer, totalizerValue, totalizerUnit, avgLabel, avgValue, icon: Icon, color, trendData }) => {
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
  
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`kpi-card-${title.toLowerCase().replace(/[₄₂]/g, '').replace(/\s+/g, '-')}`}>
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
            <span className="text-3xl font-bold font-mono tracking-tighter text-slate-900" data-testid={`${title.toLowerCase().replace(/[₄₂]/g, '').replace(/\s+/g, '-')}-value`}>
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

        {/* Info box */}
        <div className={`${colorClasses.light} rounded-md p-3 border ${colorClasses.border} mb-3 min-h-[76px] flex flex-col justify-center`}>
          <div className="text-xs text-slate-500 mb-1">{totalizer}</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-slate-900">{totalizerValue}</span>
            {totalizerUnit && <span className="text-xs text-slate-500">{totalizerUnit}</span>}
          </div>
          {avgLabel && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="text-xs text-slate-500">{avgLabel}</div>
              <div className="text-sm font-bold font-mono text-slate-800">{avgValue}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KPISummary = () => {
  const generateTrendData = (baseValue, variance) => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: baseValue + (Math.random() * variance * 2 - variance)
    }));
  };

  const kpiData = [
    {
      title: 'Raw Biogas Flow',
      value: '1250',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer (24 Hr)',
      totalizerValue: '30,000',
      totalizerUnit: 'Nm³',
      avgLabel: null,
      avgValue: null,
      icon: Wind,
      color: 'bg-emerald-600',
      trendData: generateTrendData(1250, 50)
    },
    {
      title: 'Purified Gas Flow',
      value: '1180',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer (24 Hr)',
      totalizerValue: '28,320',
      totalizerUnit: 'Nm³',
      avgLabel: null,
      avgValue: null,
      icon: Droplet,
      color: 'bg-violet-700',
      trendData: generateTrendData(1180, 40)
    },
    {
      title: 'Product Gas Flow',
      value: '1150',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer (24 Hr)',
      totalizerValue: '27,600',
      totalizerUnit: 'Nm³',
      avgLabel: null,
      avgValue: null,
      icon: TrendingUp,
      color: 'bg-cyan-600',
      trendData: generateTrendData(1150, 35)
    },
    {
      title: 'CH₄',
      value: '96.8',
      unit: '%',
      totalizer: 'Avg 1 Hr',
      totalizerValue: '96.8',
      totalizerUnit: '%',
      avgLabel: 'Avg 12 Hr',
      avgValue: '96.5 %',
      icon: Gauge,
      color: 'bg-amber-600',
      trendData: generateTrendData(96.8, 0.5)
    },
    {
      title: 'CO₂',
      value: '2.9',
      unit: '%',
      totalizer: 'Avg 1 Hr',
      totalizerValue: '2.9',
      totalizerUnit: '%',
      avgLabel: 'Avg 12 Hr',
      avgValue: '3.1 %',
      icon: Wind,
      color: 'bg-violet-700',
      trendData: generateTrendData(2.9, 0.3)
    },
    {
      title: 'H₂S',
      value: '180',
      unit: 'ppm',
      totalizer: 'Avg 1 Hr',
      totalizerValue: '180',
      totalizerUnit: 'ppm',
      avgLabel: 'Avg 12 Hr',
      avgValue: '190 ppm',
      icon: Gauge,
      color: 'bg-rose-600',
      trendData: generateTrendData(180, 15)
    }
  ];

  return (
    <div className="mb-6" data-testid="kpi-summary-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">KPI Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
};

export default KPISummary;
