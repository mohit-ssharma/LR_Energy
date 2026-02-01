import React from 'react';
import { Waves, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const FlowMeterCard = ({ title, flowRate, totalizer, percentage, color }) => {
  const generateSparklineData = () => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: parseFloat(flowRate) + Math.random() * 20 - 10
    }));
  };

  const sparklineData = generateSparklineData();
  
  const getColorClasses = (color) => {
    const colors = {
      'emerald': { bg: 'bg-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', stroke: '#10b981' },
      'violet': { bg: 'bg-violet-700', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', stroke: '#8b5cf6' },
      'cyan': { bg: 'bg-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', stroke: '#06b6d4' },
      'amber': { bg: 'bg-amber-600', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', stroke: '#f59e0b' }
    };
    return colors[color] || colors.emerald;
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid={`flow-meter-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-md ${colorClasses.bg}`}>
            <Waves className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">08:43:41</span>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <div className="text-xs text-slate-500 mb-1">Flow Rate</div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono tracking-tighter text-slate-900" data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-flow-rate`}>
              {flowRate}
            </span>
            <span className="text-sm font-medium text-slate-400">Nm³/hr</span>
          </div>
        </div>

        <div className="h-12 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
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

        <div className={`${colorClasses.light} rounded-md p-3 border ${colorClasses.border} mb-3`}>
          <div className="text-xs text-slate-500 mb-1">Totalizer</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-slate-900">{totalizer}</span>
            <span className="text-xs text-slate-500">m³</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Capacity Utilization</span>
            <span className="text-xs font-bold font-mono text-slate-900">{percentage}%</span>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100">
            <div
              style={{ width: `${percentage}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${colorClasses.bg} transition-all duration-300`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WaterFlowMeters = () => {
  const flowMetersData = [
    {
      title: 'Fresh Water FM',
      flowRate: '45.8',
      totalizer: '1,523.6',
      percentage: 31,
      color: 'emerald'
    },
    {
      title: 'Feed FM – I',
      flowRate: '125.3',
      totalizer: '4,856.2',
      percentage: 84,
      color: 'violet'
    },
    {
      title: 'Recycle Water FM',
      flowRate: '68.7',
      totalizer: '2,342.1',
      percentage: 46,
      color: 'cyan'
    },
    {
      title: 'Feed FM – II',
      flowRate: '132.5',
      totalizer: '5,127.8',
      percentage: 88,
      color: 'amber'
    }
  ];

  return (
    <div className="mb-6" data-testid="water-flow-meters-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Water Flow Meters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {flowMetersData.map((meter, index) => (
          <FlowMeterCard key={index} {...meter} />
        ))}
      </div>
    </div>
  );
};

export default WaterFlowMeters;
