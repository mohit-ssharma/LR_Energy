import React from 'react';
import { Thermometer, Gauge, BarChart3 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const Digester = ({ unit, data }) => {
  const tempComparisonData = [
    { name: 'Bottom', value: data.temperature.bottom },
    { name: 'Top', value: data.temperature.top }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300" data-testid={`digester-${unit}-section`}>
      <div className="flex items-center space-x-2 mb-5">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Digester {unit}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Unit {unit}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Temperature Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Thermometer className="w-5 h-5 text-orange-600" />
            <h4 className="text-sm font-semibold text-gray-700">Temperature</h4>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <div className="text-xs text-gray-600 mb-1">Bottom Temperature</div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-bold text-gray-800" data-testid={`digester-${unit}-temp-bottom`}>{data.temperature.bottom}</span>
              <span className="text-sm text-gray-600">°C</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Min: 35°C</span>
              <span>Max: 42°C</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                style={{ width: `${((data.temperature.bottom - 35) / (42 - 35)) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">08:43:41</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
            <div className="text-xs text-gray-600 mb-1">Top Temperature</div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-bold text-gray-800" data-testid={`digester-${unit}-temp-top`}>{data.temperature.top}</span>
              <span className="text-sm text-gray-600">°C</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Min: 35°C</span>
              <span>Max: 42°C</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                style={{ width: `${((data.temperature.top - 35) / (42 - 35)) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">08:43:41</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Comparison</div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={tempComparisonData}>
                <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                <YAxis hide domain={[35, 42]} />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pressure Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Gauge className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-700">Pressure</h4>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="text-xs text-gray-600 mb-1">Balloon Gas Pressure</div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-bold text-gray-800" data-testid={`digester-${unit}-gas-pressure`}>{data.pressure.balloonGas}</span>
              <span className="text-sm text-gray-600">mmWC</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{Math.round((data.pressure.balloonGas / 200) * 100)}%</span>
              <span>Max: 200</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                style={{ width: `${(data.pressure.balloonGas / 200) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">08:43:41</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div className="text-xs text-gray-600 mb-1">Balloon Air Pressure</div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-bold text-gray-800" data-testid={`digester-${unit}-air-pressure`}>{data.pressure.balloonAir}</span>
              <span className="text-sm text-gray-600">mmWC</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{Math.round((data.pressure.balloonAir / 150) * 100)}%</span>
              <span>Max: 150</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                style={{ width: `${(data.pressure.balloonAir / 150) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">08:43:41</div>
          </div>
        </div>

        {/* Levels Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h4 className="text-sm font-semibold text-gray-700">Levels</h4>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-200">
            <div className="text-xs text-gray-600 mb-1">Gas Level</div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-bold text-gray-800" data-testid={`digester-${unit}-gas-level`}>{data.levels.gasLevel}</span>
              <span className="text-sm text-gray-600">%</span>
            </div>
            <div className="relative h-24 bg-gray-200 rounded-lg overflow-hidden mt-3">
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-teal-500 to-emerald-400 transition-all duration-500"
                style={{ height: `${data.levels.gasLevel}%` }}
              >
                <div className="absolute top-2 left-0 right-0 text-center text-white text-xs font-semibold">
                  {data.levels.gasLevel}%
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">08:43:41</div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
            <div className="text-xs text-gray-600 mb-1">Balloon Air Level</div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-bold text-gray-800" data-testid={`digester-${unit}-air-level`}>{data.levels.balloonAirLevel}</span>
              <span className="text-sm text-gray-600">mmWC</span>
            </div>
            <div className="text-xs text-gray-500">{(parseFloat(data.levels.balloonAirLevel) * 10).toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-2">08:43:41</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
            <div className="text-xs text-gray-600 mb-1">Slurry Level Height</div>
            <div className="flex items-baseline space-x-1 mb-2">
              <span className="text-2xl font-bold text-gray-800" data-testid={`digester-${unit}-slurry-level`}>{data.levels.slurryLevelHeight}</span>
              <span className="text-sm text-gray-600">Meter</span>
            </div>
            <div className="text-xs text-gray-500">{(parseFloat(data.levels.slurryLevelHeight) * 10).toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-2">08:43:41</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DigestersSection = () => {
  const digester1Data = {
    temperature: { bottom: '38.5', top: '39.2' },
    pressure: { balloonGas: '152.3', balloonAir: '98.5' },
    levels: { gasLevel: '78.5', balloonAirLevel: '125.8', slurryLevelHeight: '4.25' }
  };

  const digester2Data = {
    temperature: { bottom: '37.8', top: '38.6' },
    pressure: { balloonGas: '148.7', balloonAir: '96.2' },
    levels: { gasLevel: '76.2', balloonAirLevel: '122.3', slurryLevelHeight: '4.18' }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Digesters</h2>
      <div className="space-y-6">
        <Digester unit="1" data={digester1Data} />
        <Digester unit="2" data={digester2Data} />
      </div>
    </div>
  );
};

export default DigestersSection;
