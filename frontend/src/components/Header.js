import React, { useState, useEffect } from 'react';
import { Clock, Activity, LogOut, List } from 'lucide-react';

const Header = ({ currentPage, onNavigate, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
              title="Powered by ELAN"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
