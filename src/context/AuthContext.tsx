import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User, AppCredential } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAppAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  verifyAppCredentials: (username: string, password: string) => Promise<boolean>;
  updateAppCredentials: (username: string, password: string) => Promise<void>;
  getAppCredentials: () => Promise<{ username: string; password: string } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const APP_AUTH_KEY = 'packaging-spec-app-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAuthenticated, setIsAppAuthenticated] = useState(() => {
    return sessionStorage.getItem(APP_AUTH_KEY) === 'true';
  });

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
    return data;
  };

  const refreshUser = async () => {
    if (session?.user?.id) {
      const profile = await fetchUserProfile(session.user.id);
      setUser(profile);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        
        if (session?.user?.id) {
          setTimeout(async () => {
            if (!isMounted) return;
            const profile = await fetchUserProfile(session.user.id);
            if (isMounted) {
              setUser(profile);
              setLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsAppAuthenticated(false);
          sessionStorage.removeItem(APP_AUTH_KEY);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      if (!session) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setIsAppAuthenticated(false);
    sessionStorage.removeItem(APP_AUTH_KEY);
  };

  const verifyAppCredentials = useCallback(async (username: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('app_credentials')
      .select('username, password')
      .limit(1)
      .single<Pick<AppCredential, 'username' | 'password'>>();

    if (error || !data) return false;

    if (data.username === username && data.password === password) {
      setIsAppAuthenticated(true);
      sessionStorage.setItem(APP_AUTH_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const updateAppCredentials = useCallback(async (username: string, password: string) => {
    const { data: existing } = await supabase
      .from('app_credentials')
      .select('id')
      .limit(1)
      .single<Pick<AppCredential, 'id'>>();

    if (!existing) throw new Error('No credentials record found');

    const { error } = await (supabase
      .from('app_credentials') as ReturnType<typeof supabase.from>)
      .update({ username, password, updated_by: session?.user?.id ?? null })
      .eq('id', existing.id);

    if (error) throw error;
  }, [session]);

  const getAppCredentials = useCallback(async () => {
    const { data, error } = await supabase
      .from('app_credentials')
      .select('username, password')
      .limit(1)
      .single<Pick<AppCredential, 'username' | 'password'>>();

    if (error || !data) return null;
    return { username: data.username, password: data.password };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isAppAuthenticated,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        refreshUser,
        verifyAppCredentials,
        updateAppCredentials,
        getAppCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
