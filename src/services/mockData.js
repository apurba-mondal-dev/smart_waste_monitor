const KEY_LOCATIONS = 'smw_locations';
const KEY_UPDATES = 'smw_updates';
const KEY_ALERTS = 'smw_alerts';
const KEY_PROFILES = 'smw_profiles';

const initialProfiles = [
  { id: 'user-admin', email: 'admin@campus.edu', full_name: 'Admin User', role: 'admin', created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: 'user-staff', email: 'staff@campus.edu', full_name: 'Staff Member', role: 'staff', created_at: new Date(Date.now() - 86400000 * 20).toISOString() }
];

const initialLocations = [
  { id: 'loc-1', name: 'Main Canteen Area', building: 'Zone A - Student Center', description: 'Main dining hall waste bins. High volume area.', current_status: 'normal', last_checked: new Date(Date.now() - 3600000 * 2).toISOString(), created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'loc-2', name: 'Engineering Block B Lobby', building: 'Zone B - Engineering', description: 'Recycling and trash bins near the main elevator.', current_status: 'attention', last_checked: new Date(Date.now() - 3600000 * 4).toISOString(), created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'loc-3', name: 'Central Library Entrance', building: 'Zone A - Academic', description: 'Lobby trash bins near the security desk.', current_status: 'normal', last_checked: new Date(Date.now() - 3600000 * 6).toISOString(), created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'loc-4', name: 'Sports Complex Cafeteria', building: 'Zone C - Sports', description: 'Food court bins near outdoor tennis courts.', current_status: 'critical', last_checked: new Date(Date.now() - 3600000 * 1).toISOString(), created_at: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'loc-5', name: 'Science Lab Courtyard', building: 'Zone B - Science', description: 'Compost and waste disposal bins outside Biology wing.', current_status: 'normal', last_checked: new Date(Date.now() - 3600000 * 8).toISOString(), created_at: new Date(Date.now() - 86400000 * 15).toISOString() }
];

const initialUpdates = [
  { id: 'upd-1', location_id: 'loc-1', user_id: 'user-staff', status: 'attention', observation: 'Bins are about 75% full. Needs monitoring.', image_url: '', created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 'upd-2', location_id: 'loc-1', user_id: 'user-admin', status: 'normal', observation: 'Bins emptied by maintenance.', image_url: '', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'upd-3', location_id: 'loc-2', user_id: 'user-staff', status: 'attention', observation: 'Cardboard box recycling bin overflowing.', image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'upd-4', location_id: 'loc-4', user_id: 'user-staff', status: 'critical', observation: 'Trash bins overflowing. Odor spreading. Immediate cleaning required.', image_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60', created_at: new Date(Date.now() - 3600000 * 1).toISOString() }
];

const initialAlerts = [
  {
    id: 'alt-1',
    location_id: 'loc-4',
    update_id: 'upd-4',
    severity: 'High',
    message: 'Critical waste accumulation at Sports Complex Cafeteria',
    status: 'open',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    resolved_at: null,
    resolved_by: null
  },
  {
    id: 'alt-2',
    location_id: 'loc-1',
    update_id: 'upd-1',
    severity: 'Medium',
    message: 'Attention required at Main Canteen Area',
    status: 'resolved',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    resolved_by: 'user-admin'
  }
];

const getOrInit = (key, initial) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

export const getMockData = () => {
  return {
    profiles: getOrInit(KEY_PROFILES, initialProfiles),
    locations: getOrInit(KEY_LOCATIONS, initialLocations),
    updates: getOrInit(KEY_UPDATES, initialUpdates),
    alerts: getOrInit(KEY_ALERTS, initialAlerts)
  };
};

export const saveMockData = (data) => {
  if (data.profiles) localStorage.setItem(KEY_PROFILES, JSON.stringify(data.profiles));
  if (data.locations) localStorage.setItem(KEY_LOCATIONS, JSON.stringify(data.locations));
  if (data.updates) localStorage.setItem(KEY_UPDATES, JSON.stringify(data.updates));
  if (data.alerts) localStorage.setItem(KEY_ALERTS, JSON.stringify(data.alerts));
};

