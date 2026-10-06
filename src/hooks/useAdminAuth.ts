import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getSupabaseClient } from '../services/supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
  avatar_url?: string;
}

export interface AdminAuthState {
  user: AdminUser | null;
  session: any;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Fetch profile and check admin status
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return null;

    try {
      const client = getSupabaseClient();
      const { data: profile, error } = await client
        .from('profiles')
        .select('name, role, avatar_url')
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        return null;
      }

      // Verify role is admin/editor
      if (profile.role === 'superadmin' || profile.role === 'editor') {
        return {
          id: userId,
          email: '', // Will be filled from session
          name: profile.name,
          role: profile.role,
          avatar_url: profile.avatar_url
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const client = getSupabaseClient();

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          if (profile) {
            setUser({ ...profile, email: session.user.email });
          }
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser({ ...profile, email: session.user.email });
        } else {
          // Not an admin - sign out
          setUser(null);
          if (event === 'SIGNED_IN') {
            await client.auth.signOut();
            setError('This account is not authorised.');
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured');
      return;
    }
    setError(null);
    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured');
      return;
    }
    setError(null);
    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const client = getSupabaseClient();
      await client.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    isAdmin: !!user,
    error,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    clearError
  };
}