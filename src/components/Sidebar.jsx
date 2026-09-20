import React from 'react';
import { LayoutDashboard, MapPin, AlertTriangle, BarChart3, Info, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, onNavigateTab }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Locations', id: 'locations', icon: MapPin },
    { name: 'Alerts', id: 'alerts', icon: AlertTriangle },
    { name: 'Analytics', id: 'analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-emerald-950 text-white min-h-[calc(100vh-4rem)] flex-shrink-0 hidden md:flex flex-col border-r border-emerald-900">
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                isActive
                  ? 'bg-green-600 text-white shadow-md shadow-green-900/30'
                  : 'text-emerald-300 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* Admin-only tab */}
        {isAdmin && (
          <button
            onClick={() => onNavigateTab('admin')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-sm mt-2 ${
              activeTab === 'admin'
                ? 'bg-green-600 text-white shadow-md shadow-green-900/30'
                : 'text-emerald-300 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-emerald-900 bg-emerald-950/40">
        <div className="flex items-center space-x-2 text-xs text-emerald-400/60">
          <Info className="h-4 w-4 text-emerald-400/50" />
          <span>V1.1 - Simplified SPA MVP</span>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
