import React from 'react';
import { LayoutDashboard, MapPin, AlertTriangle, BarChart3, Info } from 'lucide-react';

export const Sidebar = ({ activeTab, onNavigateTab }) => {
  const navItems = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Locations', id: 'locations', icon: MapPin },
    { name: 'Alerts', id: 'alerts', icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-[calc(100vh-4rem)] flex-shrink-0 hidden md:flex flex-col border-r border-slate-800">
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
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Info className="h-4 w-4 text-slate-400" />
          <span>V1.1 - Simplified SPA MVP</span>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
