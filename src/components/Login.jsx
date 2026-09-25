import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, Mail, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [shake, setShake] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoadingForm(true);

    const result = await login(email, password);
    setLoadingForm(false);

    if (!result.success) {
      setErrorMsg('Incorrect email or password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-lime-50 p-8 sm:p-10 rounded-3xl border border-lime-200 shadow-lg">
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center">
            <img src={logo} alt="Smart Waste Monitor Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="mt-4 text-3xl font-black text-gray-950 tracking-tight">Smart Waste Monitor</h2>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">Waste Monitoring & Management</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-400 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm animate-pulse-once">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Login Failed</p>
              <p className="text-red-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className={`space-y-4 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
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
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 font-medium transition ${
                    errorMsg
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200 focus:ring-green-500/20 focus:border-green-600'
                  }`}
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
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 font-medium transition ${
                    errorMsg
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200 focus:ring-green-500/20 focus:border-green-600'
                  }`}
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

