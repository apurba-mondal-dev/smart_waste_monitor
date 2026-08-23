import { supabase, isMock } from './supabase'
import { getMockData, saveMockData } from './mockData'
import { updateLocation } from './locations'

export const fetchAlerts = async () => {
  if (isMock) {
    const { alerts, locations, profiles } = getMockData();
    return [...alerts]
      .map(alt => {
        const loc = locations.find(l => l.id === alt.location_id);
        const resolver = alt.resolved_by ? profiles.find(p => p.id === alt.resolved_by) : null;
        return {
          ...alt,
          location_name: loc ? loc.name : 'Unknown Location',
          resolved_by_name: resolver ? resolver.full_name : null
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      locations:location_id(name),
      profiles:resolved_by(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(item => ({
    ...item,
    location_name: item.locations?.name || 'Unknown Location',
    resolved_by_name: item.profiles?.full_name || null
  }));
};

export const resolveAlert = async (alertId, userId) => {
  const timestamp = new Date().toISOString();

  if (isMock) {
    const data = getMockData();
    const index = data.alerts.findIndex(a => a.id === alertId);
    if (index === -1) throw new Error('Alert not found');

    const alert = data.alerts[index];
    alert.status = 'resolved';
    alert.resolved_at = timestamp;
    alert.resolved_by = userId;

    // Reset location status to Normal when alert is resolved
    const locIdx = data.locations.findIndex(l => l.id === alert.location_id);
    if (locIdx !== -1) {
      data.locations[locIdx].current_status = 'normal';
      data.locations[locIdx].last_checked = timestamp;
    }

    saveMockData(data);
    return alert;
  }

  // 1. Resolve alert in Supabase
  const { data: updatedAlert, error: alertError } = await supabase
    .from('alerts')
    .update({
      status: 'resolved',
      resolved_at: timestamp,
      resolved_by: userId
    })
    .eq('id', alertId)
    .select()
    .single();

  if (alertError) throw alertError;

  // 2. Reset location status to normal in Supabase
  await updateLocation(updatedAlert.location_id, { current_status: 'normal' });

  return updatedAlert;
};

