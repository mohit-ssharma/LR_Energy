import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const GasComposition = () => {
  const compositionData = [
    { name: 'CH₄', value: 96.8, color: '#3b82f6', unit: '%' },
    { name: 'CO₂', value: 2.85, color: '#10b981', unit: '%' },
    { name: 'O₂', value: 0.42, color: '#f59e0b', unit: '%' },
  ];

  const detailedData = [
    { label: 'CH₄', value: '96.8', unit: '%', current: 100, color: 'bg-blue-500' },
    { label: 'CO₂', value: '2.85', unit: '%', current: 100, color: 'bg-green-500' },
    { label: 'O₂', value: '0.42', unit: '%', current: 100, color: 'bg-amber-500' },
    { label: 'H₂S', value: '12.5', unit: 'ppm', current: 12.5, limit: 100, color: 'bg-red-500' },
  ];

  return (
    <div className="mb-8" data-testid="gas-composition-section">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Gas Composition (Detailed)</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Composition Distribution</span>
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Detailed Parameters</h3>
            <div className="space-y-4">
              {detailedData.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100" data-testid={`gas-param-${item.label.toLowerCase()}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">08:43:41</span>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                    <span className="text-sm text-gray-500">{item.unit}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-gray-600">
                          Current: {item.current}{item.unit}
                        </span>
                      </div>
                      {item.limit && (
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-gray-600">
                            Limit: {item.limit}{item.unit}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${item.limit ? (item.current / item.limit) * 100 : 100}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${item.color}`}
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
