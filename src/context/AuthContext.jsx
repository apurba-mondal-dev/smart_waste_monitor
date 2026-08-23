import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMock } from '../services/supabase';
import { getMockData } from '../services/mockData';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isMock) {
        // Mock Session Restore
        const storedUser = sessionStorage.getItem('smw_session_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setLoading(false);
        return;
      }

      // Supabase Session Restore
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }

      // Auth Listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            await fetchProfile(session.user.id, session.user.email);
          } else {
            setUser(null);
            setLoading(false);
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const fetchProfile = async (uid, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        console.warn('Profile not found, creating a default profile', error);
        // Fallback or create profile if not exists
        const defaultProfile = { id: uid, email, full_name: email.split('@')[0], role: 'staff' };
        setUser(defaultProfile);
      } else {
        setUser(data);
      }
    } catch (err) {
      console.error('Error fetching user profile', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isMock) {
        // Authenticate with mock profiles
        const { profiles } = getMockData();
        const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        
        // Simple mock credential check (passwords: admin123 and staff123)
        if (found) {
          const expectedPassword = found.role === 'admin' ? 'admin123' : 'staff123';
          if (password === expectedPassword) {
            setUser(found);
            sessionStorage.setItem('smw_session_user', JSON.stringify(found));
            setLoading(false);
            return { success: true };
          }
        }
        throw new Error('Invalid email or password');
      }

      // Real Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Profile is fetched in onAuthStateChange
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isMock) {
      setUser(null);
      sessionStorage.removeItem('smw_session_user');
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

