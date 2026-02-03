import React from 'react';
import { TrendingUp, Droplet, Wind, Gauge, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';

// KPI Card Component - Exact copy from KPISummary.js
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

// MNRE KPI Summary - Only shows Raw Biogas, Purified Gas, Product Gas flows
const MNREKPISummary = () => {
  const generateTrendData = (baseValue) => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: baseValue + Math.random() * 20 - 10
    }));
  };

  // Only the 3 gas flow KPIs for MNRE
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
    }
  ];

  return (
    <div className="mb-6" data-testid="mnre-kpi-summary-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Gas Flow Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
};

// MNRE Gas Composition - Exact copy from GasComposition.js
const MNREGasComposition = () => {
  const compositionData = [
    { name: 'CH₄', value: 96.8, color: '#10b981', unit: '%' },
    { name: 'CO₂', value: 2.85, color: '#8b5cf6', unit: '%' },
    { name: 'O₂', value: 0.42, color: '#f59e0b', unit: '%' },
  ];

  const detailedData = [
    { label: 'CH₄', value: '96.8', unit: '%', current: 96.8, target: 100, status: 'normal', color: 'emerald' },
    { label: 'CO₂', value: '2.85', unit: '%', current: 2.85, target: 100, status: 'normal', color: 'violet' },
    { label: 'O₂', value: '0.42', unit: '%', current: 0.42, target: 100, status: 'normal', color: 'amber' },
    { label: 'H₂S', value: '12.5', unit: 'ppm', current: 12.5, limit: 100, status: 'warning', color: 'rose' },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="mb-6" data-testid="mnre-gas-composition-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Gas Composition (Detailed)</h2>
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="lg:col-span-2 p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {compositionData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-medium text-slate-600">{item.name}</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-3 p-5 bg-gradient-to-br from-emerald-50/20 to-white">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-600">Detailed Parameters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detailedData.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-3 border border-slate-200" data-testid={`mnre-gas-param-${item.label.toLowerCase()}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                      <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">{item.value}</span>
                    <span className="text-sm font-medium text-slate-400">{item.unit}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-1 items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {item.limit ? `${item.current}/${item.limit}` : `${item.current}%`}
                      </span>
                    </div>
                    <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-slate-200">
                      <div
                        style={{ width: `${item.limit ? (item.current / item.limit) * 100 : item.current}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${item.color}-500 transition-all duration-300`}
                      ></div>
                    </div>
                  </div>
                  {item.status === 'warning' && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-amber-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Approaching limit</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main MNRE Dashboard Component
const MNREDashboard = () => {
  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen" data-testid="mnre-dashboard-page">
      <MNREKPISummary />
      <MNREGasComposition />
    </div>
  );
};

export default MNREDashboard;
