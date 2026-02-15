import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const GasComposition = () => {
  const compositionData = [
    { name: 'CH₄', value: 96.8, color: '#10b981', unit: '%' },
    { name: 'CO₂', value: 2.9, color: '#8b5cf6', unit: '%' },
    { name: 'O₂', value: 0.3, color: '#f59e0b', unit: '%' },
  ];

  // Status logic based on requirements:
  // CH₄ ≥ 96% → Accepted
  // O₂ < 0.5% → Normal
  // CO₂ < 5% → Normal
  // H₂S < 5 ppm → Accepted, ≥ 5 → Critical
  const getStatus = (label, value) => {
    if (label === 'CH₄') {
      return value >= 96 ? 'Accepted' : 'Warning';
    }
    if (label === 'O₂') {
      return value < 0.5 ? 'Normal' : 'Warning';
    }
    if (label === 'CO₂') {
      return value < 5 ? 'Normal' : 'Warning';
    }
    if (label === 'H₂S') {
      return value < 5 ? 'Accepted' : 'Critical';
    }
    return 'Normal';
  };

  const detailedData = [
    { label: 'CH₄', value: '96.8', unit: '%', current: 96.8, target: 100, status: getStatus('CH₄', 96.8), color: 'emerald' },
    { label: 'CO₂', value: '2.9', unit: '%', current: 2.9, target: 100, status: getStatus('CO₂', 2.9), color: 'violet' },
    { label: 'O₂', value: '0.3', unit: '%', current: 0.3, target: 100, status: getStatus('O₂', 0.3), color: 'amber' },
    { label: 'H₂S', value: '3', unit: 'ppm', current: 3, limit: 105, status: getStatus('H₂S', 3), color: 'rose' },
  ];

  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'normal': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="mb-6" data-testid="gas-composition-section">
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
                <div key={index} className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-3 border border-slate-200" data-testid={`gas-param-${item.label.toLowerCase().replace(/[₄₂]/g, '')}`}>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasComposition;
