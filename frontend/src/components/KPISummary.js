import React from 'react';
import { TrendingUp, Droplet, Wind, Gauge, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const KPICard = ({ title, value, unit, totalizer, totalizerValue, totalizerUnit, icon: Icon, color, trendData, change }) => {
  const isPositive = change >= 0;
  
  const getColorClasses = (color) => {
    const colors = {
      'bg-emerald-600': { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', stroke: '#10b981' },
      'bg-violet-700': { bg: 'bg-violet-700', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', stroke: '#8b5cf6' },
      'bg-cyan-600': { bg: 'bg-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', stroke: '#06b6d4' },
      'bg-amber-600': { bg: 'bg-amber-600', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', stroke: '#f59e0b' }
    };
    return colors[color] || colors['bg-emerald-600'];
  };

  const colorClasses = getColorClasses(color);
  
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
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
            <span className="text-3xl font-bold font-mono tracking-tighter text-slate-900" data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
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

        {/* Fixed height box for uniform appearance */}
        <div className={`${colorClasses.light} rounded-md p-3 border ${colorClasses.border} mb-3 min-h-[76px] flex flex-col justify-center`}>
          <div className="text-xs text-slate-500 mb-1">{totalizer}</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-slate-900">{totalizerValue}</span>
            {totalizerUnit && <span className="text-xs text-slate-500">{totalizerUnit}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Change</span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold ${
            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPISummary = () => {
  const generateTrendData = (baseValue) => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: baseValue + Math.random() * 20 - 10
    }));
  };

  const kpiData = [
    {
      title: 'Raw Biogas Flow',
      value: '342.5',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer',
      totalizerValue: '12,450.8',
      totalizerUnit: 'Nm³',
      icon: Wind,
      color: 'bg-emerald-600',
      trendData: generateTrendData(342.5),
      change: 5.2
    },
    {
      title: 'Purified Gas Flow',
      value: '318.2',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer',
      totalizerValue: '11,523.6',
      totalizerUnit: 'Nm³',
      icon: Droplet,
      color: 'bg-violet-700',
      trendData: generateTrendData(318.2),
      change: 3.8
    },
    {
      title: 'Product Gas Flow',
      value: '245.7',
      unit: 'Kg/hr',
      totalizer: 'Totalizer',
      totalizerValue: '8,921.4',
      totalizerUnit: 'Kg',
      icon: TrendingUp,
      color: 'bg-cyan-600',
      trendData: generateTrendData(245.7),
      change: 2.1
    },
    {
      title: 'CH₄ Concentration',
      value: '96.8',
      unit: '%',
      totalizer: 'Status',
      totalizerValue: 'Optimal',
      totalizerUnit: '',
      icon: Gauge,
      color: 'bg-amber-600',
      trendData: generateTrendData(96.8),
      change: 0.3
    },
    {
      title: 'O₂ Concentration',
      value: '0.42',
      unit: '%',
      totalizer: 'Status',
      totalizerValue: 'Normal',
      totalizerUnit: '',
      icon: Wind,
      color: 'bg-emerald-600',
      trendData: generateTrendData(0.42),
      change: -0.05
    },
    {
      title: 'Dew Point',
      value: '2.85',
      unit: 'mg/m³',
      totalizer: 'Status',
      totalizerValue: 'Within Limits',
      totalizerUnit: '',
      icon: Droplet,
      color: 'bg-cyan-600',
      trendData: generateTrendData(2.85),
      change: -1.2
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
