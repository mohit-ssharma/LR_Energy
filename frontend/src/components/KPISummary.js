import React from 'react';
import { TrendingUp, Droplet, Wind, Gauge, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const KPICard = ({ title, value, unit, totalizer, totalizerValue, totalizerUnit, icon: Icon, color, trendData, change }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-all duration-200" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md ${color}`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">08:43:41</span>
      </div>
      
      <div className="p-4">
        {/* Value - Fixed height for alignment */}
        <div className="h-16 flex items-center mb-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold font-mono tracking-tighter text-slate-900" data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
              {value}
            </span>
            <span className="text-sm font-medium text-slate-500">{unit}</span>
          </div>
        </div>
        
        {/* Chart - Fixed height */}
        <div className="h-12 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color.includes('emerald') ? '#10b981' : color.includes('violet') ? '#8b5cf6' : color.includes('cyan') ? '#06b6d4' : '#f59e0b'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color.includes('emerald') ? '#10b981' : color.includes('violet') ? '#8b5cf6' : color.includes('cyan') ? '#06b6d4' : '#f59e0b'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color.includes('emerald') ? '#10b981' : color.includes('violet') ? '#8b5cf6' : color.includes('cyan') ? '#06b6d4' : '#f59e0b'} 
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Bottom section - Fixed height for alignment */}
        <div className="flex items-center justify-between h-16">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-md px-3 py-2 border border-slate-200 flex-1 mr-2">
            <div className="text-xs text-slate-500 mb-0.5">{totalizer}</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold font-mono text-slate-700">{totalizerValue}</span>
              <span className="text-xs text-slate-400">{totalizerUnit}</span>
            </div>
          </div>
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
    return Array.from({ length: 20 }, (_, i) => ({
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
};

export default KPISummary;
