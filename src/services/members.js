import { supabase, supabaseAdmin, isMock } from './supabase';
import { getMockData, saveMockData } from './mockData';

export const fetchMembers = async () => {
  if (isMock) {
    const { profiles } = getMockData();
    return [...profiles].sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data;
};

export const createMember = async ({ full_name, email, role, password }) => {
  full_name = full_name.trim();
  email = email.trim().toLowerCase();
  if (isMock) {
    const data = getMockData();

    const exists = data.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('A member with this email already exists.');

    const newProfile = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      full_name,
      role,
      password,          // stored for mock login validation
      created_at: new Date().toISOString(),
    };

    data.profiles.push(newProfile);
    saveMockData(data);
    return newProfile;
  }

  // Real Supabase: requires admin client (service role key)
  if (!supabaseAdmin) {
    throw new Error(
      'Admin operations require VITE_SUPABASE_SERVICE_KEY in your .env file. See setup guide.'
    );
  }

  const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });
  if (signUpError) throw signUpError;

  // The DB trigger auto-creates the profile row from user_metadata.
  // We use supabaseAdmin (service role) to bypass RLS and update full_name + role.
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ full_name, role })
    .eq('id', authData.user.id)
    .select()
    .single();

  if (profileError) throw profileError;
  return profileData;
};

export const deleteMember = async (id) => {
  if (isMock) {
    const data = getMockData();
    const idx = data.profiles.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Member not found.');
    data.profiles.splice(idx, 1);
    saveMockData(data);
    return true;
  }

  if (!supabaseAdmin) {
    throw new Error(
      'Admin operations require VITE_SUPABASE_SERVICE_KEY in your .env file. See setup guide.'
    );
  }

  // Deleting from auth.users cascades to profiles via ON DELETE CASCADE
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw error;

  return true;
};
