import { supabase, isMock } from './supabase'
import { getMockData, saveMockData } from './mockData'

export const fetchLocations = async () => {
  if (isMock) {
    const { locations } = getMockData();
    // Sort by name
    return [...locations].sort((a, b) => a.name.localeCompare(b.name));
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

export const fetchLocationById = async (id) => {
  if (isMock) {
    const { locations } = getMockData();
    const loc = locations.find(l => l.id === id);
    if (!loc) throw new Error('Location not found');
    return loc;
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createLocation = async (locationData) => {
  if (isMock) {
    const data = getMockData();
    const newLoc = {
      id: 'loc-' + Math.random().toString(36).substr(2, 9),
      current_status: 'normal',
      last_checked: new Date().toISOString(),
      created_at: new Date().toISOString(),
      ...locationData
    };
    data.locations.push(newLoc);
    saveMockData(data);
    return newLoc;
  }

  const { data, error } = await supabase
    .from('locations')
    .insert([locationData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateLocation = async (id, locationData) => {
  if (isMock) {
    const data = getMockData();
    const index = data.locations.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Location not found');
    
    data.locations[index] = {
      ...data.locations[index],
      ...locationData,
      last_checked: new Date().toISOString()
    };
    saveMockData(data);
    return data.locations[index];
  }

  const { data, error } = await supabase
    .from('locations')
    .update({ ...locationData, last_checked: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteLocation = async (id) => {
  if (isMock) {
    const data = getMockData();
    data.locations = data.locations.filter(l => l.id !== id);
    // clean up updates and alerts for this location
    data.updates = data.updates.filter(u => u.location_id !== id);
    data.alerts = data.alerts.filter(a => a.location_id !== id);
    saveMockData(data);
    return true;
  }

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

