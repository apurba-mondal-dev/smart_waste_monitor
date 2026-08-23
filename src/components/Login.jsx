import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Key, Mail, AlertCircle, Info } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoadingForm(true);

    const result = await login(email, password);
    setLoadingForm(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Authentication failed. Please check credentials.');
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@campus.edu');
      setPassword('admin123');
    } else {
      setEmail('staff@campus.edu');
      setPassword('staff123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-150 shadow-lg">
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <Trash2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-gray-950 tracking-tight">SmartWaste Login</h2>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">Campus Waste Monitoring & Management</p>
        </div>

        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs space-y-2">
          <div className="flex items-center space-x-1.5 font-bold">
            <Info className="h-4 w-4 text-green-600" />
            <span>Local Mock Testing Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="bg-white hover:bg-green-100/50 p-2 rounded-lg border border-green-200 text-left transition font-semibold"
            >
              <span className="block font-bold text-green-700">Admin User:</span>
              admin@campus.edu (admin123)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('staff')}
              className="bg-white hover:bg-green-100/50 p-2 rounded-lg border border-green-200 text-left transition font-semibold"
            >
              <span className="block font-bold text-green-700">Staff User:</span>
              staff@campus.edu (staff123)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-extrabold text-gray-500 tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-medium transition"
                  placeholder="name@campus.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-extrabold text-gray-500 tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Key className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-medium transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingForm}
            className="w-full flex justify-center py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-extrabold tracking-wider uppercase transition shadow-lg shadow-green-600/10 hover:shadow-xl disabled:opacity-50"
          >
            {loadingForm ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;

