import React from 'react';
import { LayoutDashboard, TrendingUp, LogOut, Shield, ArrowLeft } from 'lucide-react';

const MNREHeader = ({ currentPage, onNavigate, onLogout, showBackButton = false, onBack }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trends', label: 'Trends', icon: TrendingUp }
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50" data-testid="mnre-header">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logos and Title */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors mr-2"
                data-testid="mnre-back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </button>
            )}
            <img 
              src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
              alt="LR Energy Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-slate-800">MNRE Dashboard</h1>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-slate-500">LR Energy Biogas Plant - Karnal</p>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>MNRE View</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center - Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  data-testid={`mnre-nav-${item.id}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    currentPage === item.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right - Logout and ELAN Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              data-testid="mnre-logout-button"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Logout</span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <img 
              src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/rp3d3dho_elan_logo.jpg" 
              alt="ELAN Logo" 
              className="h-8 w-auto object-contain hidden md:block"
              title="Powered by ELAN"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default MNREHeader;
