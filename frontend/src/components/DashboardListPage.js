import React from 'react';
import { Factory, Droplet, Zap, Wind, LogOut, ArrowRight } from 'lucide-react';

const DashboardListPage = ({ onSelectDashboard, onLogout, user }) => {
  const dashboards = [
    {
      id: 'lr-energy',
      name: 'LR Energy Biogas Plant',
      industry: 'Renewable Energy',
      location: 'Plant Site A',
      icon: Droplet,
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      status: 'Online',
      statusColor: 'bg-emerald-500',
      parameters: '22 Parameters',
      lastUpdate: '2 mins ago',
      description: 'Complete biogas production monitoring with gas composition, digesters, and flow meters'
    },
    {
      id: 'solar-plant',
      name: 'Solar Power Station',
      industry: 'Solar Energy',
      location: 'Plant Site B',
      icon: Zap,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      status: 'Online',
      statusColor: 'bg-amber-500',
      parameters: '18 Parameters',
      lastUpdate: '5 mins ago',
      description: 'Solar panel monitoring with power generation, inverter status, and weather conditions'
    },
    {
      id: 'wind-farm',
      name: 'Wind Farm Station',
      industry: 'Wind Energy',
      location: 'Plant Site C',
      icon: Wind,
      color: 'from-cyan-600 to-blue-600',
      bgColor: 'from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200',
      status: 'Online',
      statusColor: 'bg-cyan-500',
      parameters: '15 Parameters',
      lastUpdate: '1 min ago',
      description: 'Wind turbine monitoring with blade rotation, power output, and wind speed tracking'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing Unit',
      industry: 'Manufacturing',
      location: 'Plant Site D',
      icon: Factory,
      color: 'from-violet-600 to-purple-600',
      bgColor: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200',
      status: 'Maintenance',
      statusColor: 'bg-amber-500',
      parameters: '20 Parameters',
      lastUpdate: '10 mins ago',
      description: 'Production line monitoring with equipment status, quality control, and output metrics'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
                alt="LR Energy Logo" 
                className="h-12 w-auto object-contain"
              />
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">SCADA Monitoring Systems</h1>
                <p className="text-sm text-slate-600 mt-1">Select a plant to monitor</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-800">{user?.name || 'Admin User'}</div>
                <div className="text-xs text-slate-500">{user?.email || 'admin@example.com'}</div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/rp3d3dho_elan_logo.jpg" 
                alt="ELAN Logo" 
                className="h-10 w-auto object-contain"
                title="Powered by ELAN"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon;
            return (
              <button
                key={dashboard.id}
                onClick={() => onSelectDashboard(dashboard.id)}
                className="bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-200 overflow-hidden text-left group"
                data-testid={`dashboard-${dashboard.id}`}
              >
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${dashboard.color} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${dashboard.statusColor} animate-pulse`}></div>
                        <span className="text-sm font-semibold">{dashboard.status}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{dashboard.name}</h3>
                    <p className="text-white/80 text-sm">{dashboard.industry}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {dashboard.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Location</div>
                      <div className="text-sm font-semibold text-slate-800">{dashboard.location}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Parameters</div>
                      <div className="text-sm font-semibold text-slate-800">{dashboard.parameters}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Last Update</div>
                      <div className="text-sm font-semibold text-slate-800">{dashboard.lastUpdate}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-sm font-medium text-slate-600">Open Dashboard</span>
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-6 border border-emerald-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Need Help?</h3>
          <p className="text-slate-600 text-sm">
            Select any dashboard above to start monitoring. Currently, only <strong>LR Energy Biogas Plant</strong> is fully configured. 
            Other dashboards will show a coming soon message.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardListPage;
