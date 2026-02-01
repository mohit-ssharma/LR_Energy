import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Demo login - accept any credentials
    onLogin({ email, name: 'Admin User' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-8 text-center">
            <div className="flex items-center justify-between mb-4 px-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
                alt="LR Energy Logo" 
                className="h-10 w-auto object-contain bg-white rounded px-2 py-1"
              />
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/rp3d3dho_elan_logo.jpg" 
                alt="ELAN Logo" 
                className="h-10 w-auto object-contain bg-white rounded px-2 py-1"
              />
            </div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SCADA Login</h1>
            <p className="text-emerald-100 text-sm">Access your monitoring dashboards</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="admin@example.com"
                    data-testid="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    data-testid="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                data-testid="login-submit"
              >
                Sign In
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Demo: Use any email and password to login
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-600">
          <p>Powered by SCADA Monitoring System</p>
          <div className="flex items-center justify-center space-x-3 mt-2">
            <span className="text-xs text-slate-500">© 2026 LR Energy</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Technology by ELAN EPMC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
