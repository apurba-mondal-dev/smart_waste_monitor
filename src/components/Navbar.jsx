import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Trash2 } from 'lucide-react';
import logo from '../assets/logo.png';

export const Navbar = ({ onNavigateTab }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-green-100/40 backdrop-blur-md border-b border-green-200/50 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand Button */}
          <button 
            onClick={() => onNavigateTab?.('dashboard')}
            className="flex items-center space-x-2 hover:opacity-90 transition focus:outline-none"
          >
            <img src={logo} alt="Smart Waste Monitor Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Smart Waste <span className="text-green-600">Monitor</span>
            </span>
          </button>

          {/* User Profile and Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600 hidden sm:block">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{user.full_name}</p>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-gray-500 hover:text-red-600 font-medium text-sm transition py-2 px-3 rounded-lg hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
