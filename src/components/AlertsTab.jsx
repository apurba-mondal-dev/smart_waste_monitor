import React, { useEffect, useState } from 'react';
import { fetchAlerts, resolveAlert } from '../services/alerts';
import { useAuth } from '../context/AuthContext';
import { AlertCard } from './AlertCard';
import { AlertTriangle, History } from 'lucide-react';

export const AlertsTab = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch campus alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (alertId) => {
    if (!user) return;
    try {
      await resolveAlert(alertId, user.id);
      await loadAlerts(); // reload
    } catch (err) {
      console.error(err);
      alert('Failed to resolve alert: ' + err.message);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'open');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
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

      {/* Active Alerts */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-1.5 text-red-500" />
          Active Alerts ({activeAlerts.length})
        </h2>

        {activeAlerts.length === 0 ? (
          <div className="bg-green-50 border border-green-150 p-6 rounded-2xl text-center text-green-800">
            <p className="font-bold text-sm">Zero Active Alerts</p>
            <p className="text-xs mt-0.5 text-green-700/80">No locations are currently classified as Critical.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAlerts.map((alt) => (
              <AlertCard key={alt.id} alert={alt} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>

      {/* Resolved Alerts History */}
      <div className="space-y-4 pt-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <History className="h-5 w-5 mr-1.5 text-slate-500" />
          Resolved Alerts History ({resolvedAlerts.length})
        </h2>

        {resolvedAlerts.length === 0 ? (
          <p className="text-gray-400 text-xs italic font-medium">No alerts have been resolved yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolvedAlerts.map((alt) => (
              <AlertCard key={alt.id} alert={alt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AlertsTab;

