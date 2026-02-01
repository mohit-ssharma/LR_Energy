import React from 'react';
import { Shield, Info } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-slate-300 border-t border-slate-700">
      <div className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left - Copyright */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
                alt="LR Energy" 
                className="h-8 w-auto object-contain bg-white rounded px-2 py-1"
              />
              <div>
                <div className="text-sm font-semibold text-white">© {currentYear} LR Energy</div>
                <div className="text-xs text-slate-400">All Rights Reserved</div>
              </div>
            </div>
          </div>

          {/* Center - Disclaimer */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-700/50 rounded-lg px-4 py-3 border border-slate-600">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">Read-Only Access</span>
              </div>
              <p className="text-xs text-slate-300">
                Monitoring data is for informational purposes only. No control actions permitted.
              </p>
            </div>
          </div>

          {/* Right - Powered by */}
          <div className="flex items-center justify-end space-x-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Powered by</div>
              <div className="text-sm font-semibold text-white">ELAN EPMC</div>
            </div>
            <img 
              src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/rp3d3dho_elan_logo.jpg" 
              alt="ELAN" 
              className="h-10 w-auto object-contain bg-white rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Bottom - Additional Info */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Info className="w-3 h-3" />
              <span>SCADA Monitoring System v1.0 | Data refresh rate: Real-time</span>
            </div>
            <div>
              <span>For support: </span>
              <a href="mailto:support@lrenergy.com" className="text-emerald-400 hover:text-emerald-300">
                support@lrenergy.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
