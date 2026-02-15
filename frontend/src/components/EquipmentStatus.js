import React from 'react';
import { Power, Zap, Activity, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { formatNumber } from '../services/api';

const EquipmentStatus = ({ dashboardData }) => {
  // Get equipment data from props
  const equipmentData = dashboardData?.equipment || null;
  const currentValues = dashboardData?.current || null;
  const lastUpdate = dashboardData?.last_update;

  // Mock data for when API is unavailable
  const getMockEquipmentData = () => ({
    psa: {
      status: 'Running',
      status_code: 1,
      running_hours_today: 22.5,
      running_minutes_today: 1350,
      running_hours_month: 680.5,
      efficiency: 94.4,
      calculated_efficiency: 94.4
    },
    compressor: {
      status: 'Running',
      status_code: 1,
      running_hours_today: 22.8,
      running_hours_month: 685.2
    },
    lt_panel: {
      status: 'Active',
      current_load_kw: 245,
      avg_power_today_kw: 242.5,
      max_power_today_kw: 280,
      min_power_today_kw: 210,
      consumption_today_kwh: 5820,
      consumption_month_kwh: 174600,
      hours_recorded_today: 24,
      hours_recorded_month: 720
    }
  });

  const getMockCurrentValues = () => ({
    raw_biogas_flow: 1250.5,
    purified_gas_flow: 1180.2
  });

  // Use actual data or mock data
  const equipment = equipmentData || getMockEquipmentData();
  const current = currentValues || getMockCurrentValues();
  const isDemo = !equipmentData;

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour12: false });
  };

  // Calculate PSA efficiency from current flows if available
  const calculateEfficiency = () => {
    const rawFlow = parseFloat(current?.raw_biogas_flow) || 0;
    const purifiedFlow = parseFloat(current?.purified_gas_flow) || 0;
    if (rawFlow > 0 && purifiedFlow > 0) {
      return ((purifiedFlow / rawFlow) * 100).toFixed(1);
    }
    return equipment?.psa?.efficiency || equipment?.psa?.calculated_efficiency || 94.4;
  };

  // PSA Card
  const PSACard = () => {
    const psa = equipment?.psa || {};
    const isRunning = psa.status_code === 1 || psa.status === 'Running';
    const efficiency = calculateEfficiency();
    
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid="psa-status">
        <div className={`px-5 py-3 border-b flex justify-between items-center ${isRunning ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${isRunning ? 'bg-emerald-600' : 'bg-rose-600'} rounded-md`}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800">PSA System</h3>
              <span className="text-xs text-slate-500">Pressure Swing Adsorption</span>
            </div>
          </div>
          <span className={`flex items-center space-x-1 text-xs px-3 py-1 rounded-full border font-semibold ${isRunning ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
            {isRunning ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
          </span>
        </div>
        <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg p-3 border border-emerald-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Efficiency</div>
              <div className="text-2xl font-bold font-mono text-emerald-700" data-testid="psa-efficiency">{efficiency}%</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Today</div>
              <div className="text-xl font-bold font-mono text-slate-800">{formatNumber(psa.running_hours_today, 1)} hrs</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">This Month</div>
              <div className="text-xl font-bold font-mono text-slate-800">{formatNumber(psa.running_hours_month, 1)} hrs</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Updated</div>
              <div className="text-sm font-mono text-slate-600">{formatTime(lastUpdate)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Compressor Card
  const CompressorCard = () => {
    const compressor = equipment?.compressor || {};
    const isRunning = compressor.status_code === 1 || compressor.status === 'Running';
    
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid="compressor-status">
        <div className={`px-5 py-3 border-b flex justify-between items-center ${isRunning ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${isRunning ? 'bg-emerald-600' : 'bg-rose-600'} rounded-md`}>
              <Power className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800">Compressor</h3>
              <span className="text-xs text-slate-500">Gas Compression Unit</span>
            </div>
          </div>
          <span className={`flex items-center space-x-1 text-xs px-3 py-1 rounded-full border font-semibold ${isRunning ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
            {isRunning ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
          </span>
        </div>
        <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50/50 rounded-lg p-3 border border-violet-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</div>
              <div className={`text-xl font-bold ${isRunning ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isRunning ? 'Running' : 'Stopped'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Today</div>
              <div className="text-xl font-bold font-mono text-slate-800">{formatNumber(compressor.running_hours_today, 1)} hrs</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">This Month</div>
              <div className="text-xl font-bold font-mono text-slate-800">{formatNumber(compressor.running_hours_month, 1)} hrs</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // LT Panel Card
  const LTPanelCard = () => {
    const ltPanel = equipment?.lt_panel || {};
    
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" data-testid="lt-panel-status">
        <div className="px-5 py-3 border-b bg-amber-50 border-amber-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-600 rounded-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800">LT Panel</h3>
              <span className="text-xs text-slate-500">Power Distribution</span>
            </div>
          </div>
          <span className="flex items-center space-x-1 text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </span>
        </div>
        <div className="p-5 bg-gradient-to-br from-slate-50/30 to-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-lg p-3 border border-amber-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Current Load</div>
              <div className="text-2xl font-bold font-mono text-amber-700" data-testid="lt-panel-load">{formatNumber(ltPanel.current_load_kw, 0)} kW</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Avg Today</div>
              <div className="text-xl font-bold font-mono text-slate-800">{formatNumber(ltPanel.avg_power_today_kw, 1)} kW</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Today</div>
              <div className="text-xl font-bold font-mono text-slate-800">{formatNumber(ltPanel.consumption_today_kwh, 0)} kWh</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg p-3 border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">This Month</div>
              <div className="text-xl font-bold font-mono text-slate-800">{formatNumber(ltPanel.consumption_month_kwh, 0)} kWh</div>
            </div>
          </div>
          
          {/* Min/Max Power */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg p-3 border border-emerald-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Min Power Today</div>
              <div className="text-lg font-bold font-mono text-emerald-700">{formatNumber(ltPanel.min_power_today_kw, 0)} kW</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-red-50/50 rounded-lg p-3 border border-rose-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Max Power Today</div>
              <div className="text-lg font-bold font-mono text-rose-700">{formatNumber(ltPanel.max_power_today_kw, 0)} kW</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6" data-testid="equipment-status-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">Equipment Status</h2>
        {isDemo && (
          <span className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>DEMO</span>
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        <PSACard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CompressorCard />
          <LTPanelCard />
        </div>
      </div>
    </div>
  );
};

export default EquipmentStatus;
