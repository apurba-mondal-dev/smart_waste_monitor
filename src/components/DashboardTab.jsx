import React, { useEffect, useState } from 'react';
import { fetchLocations } from '../services/locations';
import { fetchAlerts, resolveAlert } from '../services/alerts';
import { fetchUpdates } from '../services/updates';
import { useAuth } from '../context/AuthContext';
import { StatusCard } from './StatusCard';
import { AlertCard } from './AlertCard';
import { MapPin, CheckCircle, AlertCircle, AlertTriangle, Activity } from 'lucide-react';

export const DashboardTab = ({ onSelectLocation, onNavigateTab }) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      const locs = await fetchLocations();
      const alts = await fetchAlerts();
      const acts = await fetchUpdates();
      
      setLocations(locs);
      setAlerts(alts);
      setActivities(acts.slice(0, 5)); // Keep only latest 5
    } catch (err) {
      console.error('Error loading dashboard data', err);
      setError('Failed to fetch real-time dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleResolve = async (alertId) => {
    if (!user) return;
    try {
      await resolveAlert(alertId, user.id);
      await loadDashboardData();
    } catch (err) {
      console.error('Error resolving alert', err);
      alert('Could not resolve alert: ' + err.message);
    }
  };

  // Calculations for stats
  const totalLocations = locations.length;
  const normalLocations = locations.filter(l => l.current_status === 'normal').length;
  const attentionLocations = locations.filter(l => l.current_status === 'attention').length;
  const criticalLocations = locations.filter(l => l.current_status === 'critical').length;
  
  const activeAlerts = alerts.filter(a => a.status === 'open');

  const getMapCoords = (locId, index) => {
    const coordsMap = {
      'loc-1': { x: 220, y: 150 }, // Main Canteen
      'loc-2': { x: 500, y: 120 }, // Eng Block
      'loc-3': { x: 180, y: 320 }, // Central Library
      'loc-4': { x: 620, y: 280 }, // Sports Complex
      'loc-5': { x: 420, y: 340 }, // Science Courtyard
    };
    if (coordsMap[locId]) return coordsMap[locId];
    
    // Seeded random coordinates for new locations to stay within map bounds
    const seed = index * 45;
    const x = 100 + ((seed * 7) % 550);
    const y = 80 + ((seed * 11) % 300);
    return { x, y };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard label="Total Locations" count={totalLocations} icon={MapPin} type="total" />
        <StatusCard label="Normal Status" count={normalLocations} icon={CheckCircle} type="normal" />
        <StatusCard label="Attention Needed" count={attentionLocations} icon={AlertCircle} type="attention" />
        <StatusCard label="Critical Alerts" count={criticalLocations} icon={AlertTriangle} type="critical" />
      </div>

      {/* Interactive Map & Activities Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Campus Map */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-1.5 text-green-600" />
              Campus Status Map
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Click on location markers to view historical logs or log status updates.</p>
          </div>

          <div className="bg-slate-100 rounded-xl overflow-hidden relative border border-gray-150 aspect-[16/9]">
            <svg viewBox="0 0 800 450" className="w-full h-full select-none">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(200, 200, 200, 0.3)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <rect x="0" y="200" width="800" height="40" fill="#e2e8f0" opacity="0.8" />
              <rect x="360" y="0" width="40" height="450" fill="#e2e8f0" opacity="0.8" />
              <circle cx="380" cy="220" r="50" fill="#e2e8f0" opacity="0.9" />

              <g opacity="0.1" className="fill-slate-700 font-extrabold text-[13px]">
                <text x="50" y="80">ZONE A - STUDENT PLAZA</text>
                <text x="50" y="400">ZONE A - ACADEMIC QUAD</text>
                <text x="470" y="80">ZONE B - APPLIED SCIENCES</text>
                <text x="470" y="400">ZONE C - ATHLETICS CENTRE</text>
              </g>

              {locations.map((loc, idx) => {
                const { x, y } = getMapCoords(loc.id, idx);
                
                let colorClass = 'fill-green-500 stroke-green-100';
                if (loc.current_status === 'attention') {
                  colorClass = 'fill-amber-500 stroke-amber-100';
                } else if (loc.current_status === 'critical') {
                  colorClass = 'fill-red-500 stroke-red-100';
                }

                return (
                  <g 
                    key={loc.id} 
                    onClick={() => onSelectLocation(loc.id)} 
                    className="group cursor-pointer"
                  >
                    {loc.current_status !== 'normal' && (
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        className={`animate-ping opacity-25 ${
                          loc.current_status === 'critical' ? 'fill-red-400' : 'fill-amber-400'
                        }`}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      className={`${colorClass} stroke-2 transition duration-200 group-hover:scale-125`}
                    />
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                      <rect
                        x={x - 80}
                        y={y - 48}
                        width="160"
                        height="32"
                        rx="6"
                        fill="#0f172a"
                      />
                      <text
                        x={x}
                        y={y - 28}
                        fill="#ffffff"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {loc.name}
                      </text>
                      <path d={`M ${x-5} ${y-16} L ${x} ${y-11} L ${x+5} ${y-16} Z`} fill="#0f172a" />
                    </g>
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-gray-150 text-[10px] font-bold space-y-1.5 shadow-sm flex flex-col">
              <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5" />Normal</div>
              <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-1.5" />Attention</div>
              <div className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5" />Critical</div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-1">
              <Activity className="h-5 w-5 mr-1.5 text-green-600" />
              Recent Activities
            </h2>
            <p className="text-xs text-gray-400 font-medium">Latest logs submitted by campus staff.</p>
          </div>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-1">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No recent updates recorded.</p>
            ) : (
              activities.map((act) => {
                let statusBadge = 'text-green-700 bg-green-50';
                if (act.status === 'attention') statusBadge = 'text-amber-700 bg-amber-50';
                if (act.status === 'critical') statusBadge = 'text-red-700 bg-red-50';

                return (
                  <div key={act.id} className="flex space-x-3 text-sm pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => onSelectLocation(act.location_id)}
                          className="font-bold text-gray-800 hover:text-green-600 transition text-left"
                        >
                          {act.location_name}
                        </button>
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${statusBadge}`}>
                          {act.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        By <span className="font-semibold text-gray-700">{act.user_name}</span> &bull; {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {act.observation && (
                        <p className="text-gray-600 text-xs mt-1.5 bg-gray-50 p-2 rounded-lg italic border-l-2 border-green-500 line-clamp-2">
                          "{act.observation}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={() => onNavigateTab('locations')}
              className="w-full inline-flex items-center justify-center py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition"
            >
              Browse All Locations
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts Row */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-1.5 text-red-500" />
              Active Alerts ({activeAlerts.length})
            </h2>
            <p className="text-xs text-gray-400 font-medium">Requires immediate response and resolution.</p>
          </div>
          <button 
            onClick={() => onNavigateTab('alerts')}
            className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
          >
            View Alert History
          </button>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="bg-green-50 border border-green-150 p-6 rounded-xl text-center text-green-800">
            <p className="font-bold text-sm">No Active Alerts</p>
            <p className="text-xs mt-0.5 text-green-700/80">Excellent! All campus waste bins are operating within acceptable limits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAlerts.map(alt => (
              <AlertCard key={alt.id} alert={alt} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardTab;

