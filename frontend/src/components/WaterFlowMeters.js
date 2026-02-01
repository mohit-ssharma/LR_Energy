import React from 'react';
import { Waves, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const FlowMeterCard = ({ title, flowRate, totalizer, percentage, color }) => {
  const generateSparklineData = () => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: parseFloat(flowRate) + Math.random() * 20 - 10
    }));
  };

  const sparklineData = generateSparklineData();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300" data-testid={`flow-meter-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          </div>
        </div>
        <span className="text-xs text-gray-400">08:43:41</span>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Flow Rate</div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-800" data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-flow-rate`}>{flowRate}</span>
          <span className="text-sm text-gray-600">Nm³/hr</span>
        </div>
      </div>

      <div className="mb-3">
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={sparklineData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color.includes('blue') ? '#3b82f6' : color.includes('green') ? '#10b981' : color.includes('purple') ? '#8b5cf6' : '#f59e0b'} 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
        <div className="text-xs text-gray-500 mb-1">Totalizer</div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-gray-700">{totalizer}</span>
          <span className="text-xs text-gray-500">m³</span>
        </div>
      </div>

      <div className="relative pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">Capacity</span>
          <span className="text-xs font-semibold text-gray-600">{percentage}%</span>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
          <div
            style={{ width: `${percentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${color}`}
          ></div>
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
      color: 'bg-blue-500'
    },
    {
      title: 'Feed FM – I',
      flowRate: '125.3',
      totalizer: '4,856.2',
      percentage: 84,
      color: 'bg-green-500'
    },
    {
      title: 'Recycle Water FM',
      flowRate: '68.7',
      totalizer: '2,342.1',
      percentage: 46,
      color: 'bg-purple-500'
    },
    {
      title: 'Feed FM – II',
      flowRate: '132.5',
      totalizer: '5,127.8',
      percentage: 88,
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="mb-8" data-testid="water-flow-meters-section">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Water Flow Meters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {flowMetersData.map((meter, index) => (
          <FlowMeterCard key={index} {...meter} />
        ))}
      </div>
    </div>
  );
};

export default WaterFlowMeters;
