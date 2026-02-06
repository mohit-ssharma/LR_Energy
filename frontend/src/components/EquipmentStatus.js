import React from 'react';
import { Power, Clock, Zap, Activity, CheckCircle2, XCircle } from 'lucide-react';

const EquipmentStatus = () => {
  // PSA Data
  const psaData = {
    status: 'Running',
    hoursToday: 22.5,
    cyclesCompleted: 145,
    efficiency: 94.2,
    lastMaintenance: '15 Jan 2026',
    nextMaintenance: '15 Feb 2026'
  };

  // LT Panel Data
  const ltPanelData = {
    status: 'Active',
    currentLoad: 245,
    maxLoad: 500,
    todayConsumption: 5880,
    monthlyConsumption: 176400,
    powerFactor: 0.92
  };

  // Compressor Data
  const compressorData = {
    status: 'Running',
    hoursToday: 21.8,
    pressure: 8.5,
    maxPressure: 10,
    temperature: 72,
    efficiency: 91.5
  };

  const StatusBadge = ({ status }) => {
    const isRunning = status === 'Running' || status === 'Active';
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
        isRunning 
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
          : 'bg-rose-100 text-rose-700 border border-rose-200'
      }`}>
        {isRunning ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        <span>{status}</span>
      </span>
    );
  };

  const CircularProgress = ({ value, max, label, unit, color }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold font-mono text-slate-900">{value}</div>
              <div className="text-xs text-slate-500">{unit}</div>
            </div>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-600 mt-2">{label}</div>
      </div>
    );
  };

  return (
    <div className="mb-6" data-testid="equipment-status-section">
      <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Equipment Status</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PSA Section */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid="psa-section">
          <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-700 rounded-md">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-800">PSA Unit</h3>
                <span className="text-xs text-slate-500">Pressure Swing Adsorption</span>
              </div>
            </div>
            <StatusBadge status={psaData.status} />
          </div>
          
          <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex justify-around mb-4">
              <CircularProgress 
                value={psaData.hoursToday} 
                max={24} 
                label="Hours Today" 
                unit="hrs"
                color="#8b5cf6"
              />
              <CircularProgress 
                value={psaData.efficiency} 
                max={100} 
                label="Efficiency" 
                unit="%"
                color="#10b981"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Cycles Completed (24Hr)</span>
                <span className="text-sm font-bold font-mono text-slate-900">{psaData.cyclesCompleted}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Last Maintenance</span>
                <span className="text-sm font-bold font-mono text-slate-900">{psaData.lastMaintenance}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-violet-50 rounded-lg border border-violet-200">
                <span className="text-sm text-violet-700">Next Maintenance</span>
                <span className="text-sm font-bold font-mono text-violet-900">{psaData.nextMaintenance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* LT Panel Section */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid="lt-panel-section">
          <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-yellow-50 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-600 rounded-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-800">LT Panel</h3>
                <span className="text-xs text-slate-500">Electricity Monitoring</span>
              </div>
            </div>
            <StatusBadge status={ltPanelData.status} />
          </div>
          
          <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex justify-around mb-4">
              <CircularProgress 
                value={ltPanelData.currentLoad} 
                max={ltPanelData.maxLoad} 
                label="Current Load" 
                unit="kW"
                color="#f59e0b"
              />
              <CircularProgress 
                value={Math.round(ltPanelData.powerFactor * 100)} 
                max={100} 
                label="Power Factor" 
                unit="%"
                color="#10b981"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-sm text-amber-700">Today's Consumption</span>
                <span className="text-sm font-bold font-mono text-amber-900">{ltPanelData.todayConsumption.toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Monthly Consumption</span>
                <span className="text-sm font-bold font-mono text-slate-900">{ltPanelData.monthlyConsumption.toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Max Load Capacity</span>
                <span className="text-sm font-bold font-mono text-slate-900">{ltPanelData.maxLoad} kW</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compressor Section */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid="compressor-section">
          <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-600 rounded-md">
                <Power className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-800">Compressor</h3>
                <span className="text-xs text-slate-500">Gas Compression Unit</span>
              </div>
            </div>
            <StatusBadge status={compressorData.status} />
          </div>
          
          <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex justify-around mb-4">
              <CircularProgress 
                value={compressorData.hoursToday} 
                max={24} 
                label="Hours Today" 
                unit="hrs"
                color="#06b6d4"
              />
              <CircularProgress 
                value={compressorData.efficiency} 
                max={100} 
                label="Efficiency" 
                unit="%"
                color="#10b981"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Operating Pressure</span>
                <span className="text-sm font-bold font-mono text-slate-900">{compressorData.pressure} / {compressorData.maxPressure} bar</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Temperature</span>
                <span className="text-sm font-bold font-mono text-slate-900">{compressorData.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                <span className="text-sm text-cyan-700">Runtime (24Hr)</span>
                <span className="text-sm font-bold font-mono text-cyan-900">{compressorData.hoursToday} hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentStatus;
