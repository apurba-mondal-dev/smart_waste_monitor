import { supabase, isMock } from './supabase'
import { getMockData, saveMockData } from './mockData'
import { updateLocation } from './locations'

export const fetchUpdates = async () => {
  if (isMock) {
    const { updates, locations, profiles } = getMockData();
    // Resolve location names and user names
    return [...updates]
      .map(upd => {
        const loc = locations.find(l => l.id === upd.location_id);
        const usr = profiles.find(p => p.id === upd.user_id);
        return {
          ...upd,
          location_name: loc ? loc.name : 'Unknown Location',
          user_name: usr ? usr.full_name : 'System/Staff'
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('waste_updates')
    .select(`
      *,
      locations:location_id(name),
      profiles:user_id(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    location_name: item.locations?.name || 'Unknown Location',
    user_name: item.profiles?.full_name || 'System/Staff'
  }));
};

export const fetchUpdatesByLocationId = async (locationId) => {
  if (isMock) {
    const { updates, profiles } = getMockData();
    return [...updates]
      .filter(upd => upd.location_id === locationId)
      .map(upd => {
        const usr = profiles.find(p => p.id === upd.user_id);
        return {
          ...upd,
          user_name: usr ? usr.full_name : 'Staff'
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('waste_updates')
    .select(`
      *,
      profiles:user_id(full_name)
    `)
    .eq('location_id', locationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(item => ({
    ...item,
    user_name: item.profiles?.full_name || 'Staff'
  }));
};

export const submitUpdate = async (updateData) => {
  const { location_id, user_id, status, observation, image_url } = updateData;
  const timestamp = new Date().toISOString();

  if (isMock) {
    const data = getMockData();
    const newUpdate = {
      id: 'upd-' + Math.random().toString(36).substr(2, 9),
      location_id,
      user_id,
      status,
      observation,
      image_url: image_url || '',
      created_at: timestamp
    };
    
    // 1. Add update
    data.updates.push(newUpdate);
    
    // 2. Update location status
    const locIdx = data.locations.findIndex(l => l.id === location_id);
    let locationName = 'Unknown Location';
    if (locIdx !== -1) {
      data.locations[locIdx].current_status = status;
      data.locations[locIdx].last_checked = timestamp;
      locationName = data.locations[locIdx].name;
    }
    
    // 3. Create alert if Critical
    if (status === 'critical') {
      // Check if there is already an open alert for this location
      const hasOpenAlert = data.alerts.some(a => a.location_id === location_id && a.status === 'open');
      if (!hasOpenAlert) {
        const newAlert = {
          id: 'alt-' + Math.random().toString(36).substr(2, 9),
          location_id,
          update_id: newUpdate.id,
          severity: 'High',
          message: `Critical waste accumulation reported at ${locationName}`,
          status: 'open',
          created_at: timestamp,
          resolved_at: null,
          resolved_by: null
        };
        data.alerts.push(newAlert);
      }
    }
    
    saveMockData(data);
    return newUpdate;
  }

  // 1. Insert update in Supabase
  const { data: insertedUpdate, error: updateError } = await supabase
    .from('waste_updates')
    .insert([{ location_id, user_id, status, observation, image_url: image_url || '' }])
    .select()
    .single();

  if (updateError) throw updateError;

  // 2. Update location current_status
  await updateLocation(location_id, { current_status: status });

  // 3. If critical, create alert (normally database triggers handle this, but doing it in code secures it)
  if (status === 'critical') {
    // Check if open alert exists
    const { data: openAlerts } = await supabase
      .from('alerts')
      .select('id')
      .eq('location_id', location_id)
      .eq('status', 'open');

    if (!openAlerts || openAlerts.length === 0) {
      // Fetch location name
      const { data: loc } = await supabase
        .from('locations')
        .select('name')
        .eq('id', location_id)
        .single();
      
      const locationName = loc ? loc.name : 'Location';

      await supabase.from('alerts').insert([{
        location_id,
        update_id: insertedUpdate.id,
        severity: 'High',
        message: `Critical waste accumulation reported at ${locationName}`,
        status: 'open'
      }]);
    }
  }

  return insertedUpdate;
};

