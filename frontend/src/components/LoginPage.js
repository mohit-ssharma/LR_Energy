import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    // Authenticate using AuthContext
    const result = login(email, password);
    
    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.error || 'Invalid credentials');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Top Logo Bar - Creative Design */}
        <div className="mb-6 flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-lg blur-md opacity-30"></div>
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/aywrj4co_LR%20Energy%20Logo.jpeg" 
                alt="LR Energy Logo" 
                className="h-12 w-auto object-contain relative z-10 bg-white rounded-lg p-2 shadow-md"
              />
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-800">LR Energy</div>
              <div className="text-xs text-slate-500">Biogas Plant</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">Designed by</div>
              <div className="text-sm font-bold text-slate-800">Elan Energies</div>
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 rounded-lg blur-md opacity-30"></div>
              <img 
                src="https://customer-assets.emergentagent.com/job_4acfe114-4f71-44b3-ba66-02b58d5e96c3/artifacts/rp3d3dho_elan_logo.jpg" 
                alt="ELAN Logo" 
                className="h-12 w-auto object-contain relative z-10 bg-white rounded-lg p-2 shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full opacity-10 -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-emerald-100 text-sm">Sign in to access SCADA monitoring dashboards</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 bg-gradient-to-b from-white to-slate-50">
            {error && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-all bg-white"
                    placeholder="admin@example.com"
                    data-testid="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-all bg-white"
                    placeholder="Enter your password"
                    data-testid="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
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
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 rounded-lg font-semibold transition-all shadow-lg transform ${
                  isLoading 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:from-emerald-700 hover:to-cyan-700 hover:shadow-xl hover:scale-[1.02]'
                }`}
                data-testid="login-submit"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 mb-3">
                <div className="h-px w-12 bg-slate-200"></div>
                <p>Login Credentials</p>
                <div className="h-px w-12 bg-slate-200"></div>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>Head Office:</strong> it@lrenergy.in</p>
                <p><strong>MNRE:</strong> it1@lrenergy.in</p>
                <p className="text-slate-400">Password: qwerty</p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="bg-white/60 backdrop-blur-lg rounded-xl p-4 border border-white/50">
            <p className="text-sm font-semibold text-slate-700">Secure SCADA Monitoring System</p>
            <div className="flex items-center justify-center space-x-2 mt-2 text-xs text-slate-500">
              <span>© 2026 LR Energy</span>
              <span>•</span>
              <span>Designed by Elan Energies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
