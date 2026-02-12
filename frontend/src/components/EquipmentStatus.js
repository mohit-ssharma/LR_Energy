import React, { useState, useEffect, useCallback } from 'react';
import { Power, Zap, Activity, CheckCircle2, XCircle, RefreshCw, WifiOff } from 'lucide-react';
import { getDashboardData, formatNumber } from '../services/api';

const EquipmentStatus = () => {
  const [equipmentData, setEquipmentData] = useState(null);
  const [currentValues, setCurrentValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch equipment data from dashboard API
  const fetchData = useCallback(async () => {
    try {
      const result = await getDashboardData();
      
      if (result.success) {
        setEquipmentData(result.data.equipment);
        setCurrentValues(result.data.current);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh every 60 seconds
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

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
    const percentage = max > 0 ? (value / max) * 100 : 0;
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

  // Loading state
  if (loading) {
    return (
      <div className="mb-6" data-testid="equipment-status-section">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Equipment Status</h2>
        <div className="flex items-center justify-center p-8 bg-white rounded-lg border border-slate-200">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mr-2" />
          <span className="text-slate-500">Loading equipment data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mb-6" data-testid="equipment-status-section">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800 mb-4">Equipment Status</h2>
        <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <WifiOff className="w-6 h-6 text-red-400 mr-2" />
          <span className="text-red-600">Failed to load equipment data</span>
          <button 
            onClick={fetchData}
            className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const psa = equipmentData?.psa || {};
  const ltPanel = equipmentData?.lt_panel || {};
  const compressor = equipmentData?.compressor || {};

  // Get current flow values for efficiency display
  const rawBiogasFlow = currentValues?.raw_biogas_flow || 0;
  const purifiedGasFlow = currentValues?.purified_gas_flow || 0;

  return (
    <div className="mb-6" data-testid="equipment-status-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">Equipment Status</h2>
        <button 
          onClick={fetchData}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
          title="Refresh data"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>
      
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
            <StatusBadge status={psa.status || 'Stopped'} />
          </div>
          
          <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex justify-around mb-4">
              <CircularProgress 
                value={psa.running_hours_today || 0} 
                max={24} 
                label="Hours Today" 
                unit="hrs"
                color="#8b5cf6"
              />
              <CircularProgress 
                value={psa.efficiency || psa.calculated_efficiency || 0} 
                max={100} 
                label="Efficiency" 
                unit="%"
                color="#10b981"
              />
            </div>
            
            <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
              <div className="text-xs text-violet-600 mb-1">Efficiency Formula</div>
              <div className="text-sm font-mono text-violet-800">
                (Purified Gas / Raw Biogas) × 100
              </div>
              <div className="text-sm font-mono text-violet-900 mt-1">
                ({formatNumber(purifiedGasFlow, 1)} / {formatNumber(rawBiogasFlow, 1)}) × 100 = <span className="font-bold">{psa.calculated_efficiency || 0}%</span>
              </div>
            </div>
            
            {/* Monthly Running Hours */}
            <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Monthly Running Hours</span>
                <span className="font-mono font-semibold text-slate-800">{formatNumber(psa.running_hours_month, 1)} hrs</span>
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
            <StatusBadge status={ltPanel.status || 'Inactive'} />
          </div>
          
          <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex justify-center mb-4">
              <CircularProgress 
                value={ltPanel.current_load_kw || 0} 
                max={500} 
                label="Current Load" 
                unit="kW"
                color="#f59e0b"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <span className="text-sm text-amber-700 block">Today's Consumption</span>
                  <span className="text-xs text-amber-600">Avg: {formatNumber(ltPanel.avg_power_today_kw, 1)} kW</span>
                </div>
                <span className="text-lg font-bold font-mono text-amber-900">
                  {formatNumber(ltPanel.consumption_today_kwh, 0)} kWh
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-sm text-slate-600 block">Monthly Consumption</span>
                  <span className="text-xs text-slate-500">{formatNumber(ltPanel.hours_recorded_month, 0)} hrs recorded</span>
                </div>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {formatNumber(ltPanel.consumption_month_kwh, 0)} kWh
                </span>
              </div>
            </div>
            
            {/* Min/Max Power */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
                <div className="text-xs text-emerald-600">Min Today</div>
                <div className="font-mono font-semibold text-emerald-800">{formatNumber(ltPanel.min_power_today_kw, 1)} kW</div>
              </div>
              <div className="p-2 bg-rose-50 rounded border border-rose-200 text-center">
                <div className="text-xs text-rose-600">Max Today</div>
                <div className="font-mono font-semibold text-rose-800">{formatNumber(ltPanel.max_power_today_kw, 1)} kW</div>
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
            <StatusBadge status={compressor.status || 'Stopped'} />
          </div>
          
          <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
            <div className="flex justify-around mb-4">
              <CircularProgress 
                value={compressor.running_hours_today || 0} 
                max={24} 
                label="Hours Today" 
                unit="hrs"
                color="#06b6d4"
              />
              <CircularProgress 
                value={psa.calculated_efficiency || 0} 
                max={100} 
                label="Efficiency" 
                unit="%"
                color="#10b981"
              />
            </div>
            
            <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
              <div className="text-xs text-cyan-600 mb-1">Runtime Summary</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <div className="text-xs text-cyan-600">Today</div>
                  <div className="text-lg font-bold font-mono text-cyan-900">{compressor.running_hours_today || 0} hrs</div>
                </div>
                <div>
                  <div className="text-xs text-cyan-600">This Month</div>
                  <div className="text-lg font-bold font-mono text-cyan-900">{formatNumber(compressor.running_hours_month, 1)} hrs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentStatus;
