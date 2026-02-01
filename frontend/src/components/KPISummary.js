import React from 'react';
import { TrendingUp, Droplet, Wind, Gauge } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const KPICard = ({ title, value, unit, totalizer, totalizerValue, totalizerUnit, icon: Icon, color, trendData }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">{title}</div>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-800" data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-value`}>{value}</span>
          <span className="text-sm text-gray-500 font-medium">{unit}</span>
        </div>
      </div>
      <div className="mb-3">
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.includes('blue') ? '#3b82f6' : color.includes('green') ? '#10b981' : color.includes('purple') ? '#8b5cf6' : '#f59e0b'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color.includes('blue') ? '#3b82f6' : color.includes('green') ? '#10b981' : color.includes('purple') ? '#8b5cf6' : '#f59e0b'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color.includes('blue') ? '#3b82f6' : color.includes('green') ? '#10b981' : color.includes('purple') ? '#8b5cf6' : '#f59e0b'} 
              strokeWidth={2}
              fill={`url(#gradient-${title})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500 mb-1">{totalizer}</div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-gray-700">{totalizerValue}</span>
          <span className="text-xs text-gray-500">{totalizerUnit}</span>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2">08:43:41</div>
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
      color: 'bg-blue-500',
      trendData: generateTrendData(342.5)
    },
    {
      title: 'Purified Gas Flow',
      value: '318.2',
      unit: 'Nm³/hr',
      totalizer: 'Totalizer',
      totalizerValue: '11,523.6',
      totalizerUnit: 'Nm³',
      icon: Droplet,
      color: 'bg-green-500',
      trendData: generateTrendData(318.2)
    },
    {
      title: 'Product Gas Flow',
      value: '245.7',
      unit: 'Kg/hr',
      totalizer: 'Totalizer',
      totalizerValue: '8,921.4',
      totalizerUnit: 'Kg',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trendData: generateTrendData(245.7)
    },
    {
      title: 'CH₄ Concentration',
      value: '96.8',
      unit: '%',
      totalizer: 'Status',
      totalizerValue: 'Optimal',
      totalizerUnit: '',
      icon: Gauge,
      color: 'bg-amber-500',
      trendData: generateTrendData(96.8)
    },
    {
      title: 'O₂ Concentration',
      value: '0.42',
      unit: '%',
      totalizer: 'Status',
      totalizerValue: 'Normal',
      totalizerUnit: '',
      icon: Wind,
      color: 'bg-cyan-500',
      trendData: generateTrendData(0.42)
    },
    {
      title: 'Dew Point',
      value: '2.85',
      unit: 'mg/m³',
      totalizer: 'Status',
      totalizerValue: 'Within Limits',
      totalizerUnit: '',
      icon: Droplet,
      color: 'bg-teal-500',
      trendData: generateTrendData(2.85)
    }
  ];

  return (
    <div className="mb-8" data-testid="kpi-summary-section">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">KPI Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
};

export default KPISummary;
