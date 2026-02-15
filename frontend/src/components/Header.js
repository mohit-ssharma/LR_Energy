import React, { useState, useEffect, useRef } from 'react';
import { Clock, Activity, LogOut, Building2, ChevronDown } from 'lucide-react';

const Header = ({ currentPage, onNavigate, onLogout, onSwitchDashboard, currentDashboard = 'sonipat' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDashboardMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const navItems = ['Dashboard', 'Trends', 'Reports'];

  // Dashboard options for switcher
  const dashboardOptions = [
    { id: 'sonipat', name: 'Sonipat Plant', description: 'Main Biogas Plant' },
    { id: 'mnre', name: 'MNRE View', description: 'Ministry View (Limited)' }
  ];

  const currentDashboardInfo = dashboardOptions.find(d => d.id === currentDashboard) || dashboardOptions[0];

  const handleDashboardSwitch = (dashboardId) => {
    setShowDashboardMenu(false);
    if (onSwitchDashboard) {
      onSwitchDashboard(dashboardId);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
                alt="LR Energy Logo" 
                className="h-12 w-auto object-contain"
              />
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-600 animate-pulse-subtle" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">SCADA</div>
                  <div className="text-sm font-bold text-slate-900">Monitoring System</div>
                </div>
              </div>
            </div>

            {/* Dashboard Switcher - Only for HO */}
            {onSwitchDashboard && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                  className="flex items-center space-x-2 px-3 py-2 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors"
                  data-testid="dashboard-switcher"
                >
                  <Building2 className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-700">{currentDashboardInfo.name}</span>
                  <ChevronDown className={`w-4 h-4 text-violet-500 transition-transform ${showDashboardMenu ? 'rotate-180' : ''}`} />
                </button>

                {showDashboardMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      Switch Dashboard
                    </div>
                    {dashboardOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleDashboardSwitch(option.id)}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors ${
                          currentDashboard === option.id ? 'bg-emerald-50' : ''
                        }`}
                        data-testid={`switch-to-${option.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-sm font-medium ${currentDashboard === option.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {option.name}
                            </div>
                            <div className="text-xs text-slate-500">{option.description}</div>
                          </div>
                          {currentDashboard === option.id && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <nav className="flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => onNavigate(item.toLowerCase())}
                  data-testid={`nav-${item.toLowerCase()}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentPage === item.toLowerCase()
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Time</div>
              <div className="text-sm font-medium text-slate-600">{formatDate(currentTime)}</div>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-base font-mono font-bold text-slate-900 tracking-tight" data-testid="live-timestamp">
                {formatTime(currentTime)}
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <div className="h-8 w-px bg-slate-200"></div>
            <img 
              src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/rp3d3dho_elan_logo.jpg" 
              alt="ELAN Logo" 
              className="h-10 w-auto object-contain"
              title="Designed by Elan Energies"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
