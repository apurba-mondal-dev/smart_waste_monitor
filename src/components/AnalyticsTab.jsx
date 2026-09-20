import React, { useEffect, useState } from 'react';
import { fetchLocations } from '../services/locations';
import { fetchUpdates } from '../services/updates';
import { fetchAlerts } from '../services/alerts';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Clock, AlertTriangle, CheckSquare } from 'lucide-react';

export const AnalyticsTab = () => {
  const [locations, setLocations] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const locs = await fetchLocations();
        const upds = await fetchUpdates();
        const alts = await fetchAlerts();
        
        setLocations(locs);
        setUpdates(upds);
        setAlerts(alts);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // 1. Current Status Distribution Data (Pie Chart)
  const statusCounts = { normal: 0, attention: 0, critical: 0 };
  locations.forEach(l => {
    if (statusCounts[l.current_status] !== undefined) {
      statusCounts[l.current_status]++;
    }
  });

  const pieData = [
    { name: 'Normal', value: statusCounts.normal, color: '#22c55e' },
    { name: 'Attention', value: statusCounts.attention, color: '#f59e0b' },
    { name: 'Critical', value: statusCounts.critical, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // 2. Most Frequently Problematic Locations (Bar Chart)
  const locationProblems = {};
  updates.forEach(upd => {
    if (upd.status === 'critical' || upd.status === 'attention') {
      const locName = upd.location_name;
      locationProblems[locName] = (locationProblems[locName] || 0) + 1;
    }
  });

  const problematicData = Object.entries(locationProblems)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Incidents by Date (Bar Chart)
  const dailyIncidents = {};
  updates.forEach(upd => {
    if (upd.status === 'critical' || upd.status === 'attention') {
      const dateStr = new Date(upd.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
      dailyIncidents[dateStr] = (dailyIncidents[dateStr] || 0) + 1;
    }
  });

  const incidentHistoryData = Object.entries(dailyIncidents)
    .map(([date, count]) => ({ date, count }))
    .slice(-7);

  // 4. Response Time Calculations
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
  let averageResponseText = 'N/A';
  let totalMinutes = 0;

  resolvedAlerts.forEach(alt => {
    const start = new Date(alt.created_at);
    const end = new Date(alt.resolved_at);
    totalMinutes += (end - start) / 60000;
  });

  if (resolvedAlerts.length > 0) {
    const avgMins = Math.round(totalMinutes / resolvedAlerts.length);
    if (avgMins < 60) {
      averageResponseText = `${avgMins} min${avgMins !== 1 ? 's' : ''}`;
    } else {
      const hrs = Math.floor(avgMins / 60);
      const mins = avgMins % 60;
      averageResponseText = `${hrs} hr${hrs !== 1 ? 's' : ''} ${mins} m`;
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-lime-50 p-6 rounded-2xl border border-lime-200 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-green-50 text-green-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Avg Response Time</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{averageResponseText}</p>
          </div>
        </div>

        <div className="bg-lime-50 p-6 rounded-2xl border border-lime-200 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Active Incidents</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{alerts.filter(a => a.status === 'open').length}</p>
          </div>
        </div>

        <div className="bg-lime-50 p-6 rounded-2xl border border-lime-200 shadow-sm flex items-center space-x-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Total Alerts Resolved</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{resolvedAlerts.length}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Status Distribution */}
        <div className="bg-lime-50 p-6 rounded-2xl border border-lime-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">Current Status Distribution</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Breakdown of current campus waste conditions.</p>
          </div>
          
          <div className="h-64">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs font-semibold">No data to display</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Location(s)`]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Most Problematic Locations */}
        <div className="bg-lime-50 p-6 rounded-2xl border border-lime-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">Top Problematic Locations</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Locations with highest count of Critical/Attention reports.</p>
          </div>
          
          <div className="h-64">
            {problematicData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs font-semibold">No incident history logged yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problematicData} layout="vertical" margin={{ left: 20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Tooltip formatter={(value) => [`${value} Incident(s)`]} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Incident History */}
        <div className="bg-lime-50 p-6 rounded-2xl border border-lime-200 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900">Incident Frequency Timeline</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Critical/Attention reports filed by calendar date.</p>
          </div>

          <div className="h-64">
            {incidentHistoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs font-semibold">No incident records found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incidentHistoryData} margin={{ top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} Incident(s)`]} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AnalyticsTab;

