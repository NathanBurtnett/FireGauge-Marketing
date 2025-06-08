
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import {
  onAuthStateChange,
  signInTenant,
  signUpTenant,
  type SignInTenantCredentials,
  type SignUpTenantCredentials
} from '../../integrations/supabase/auth';
import type { Database } from '../../types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: Database['public']['Tables']['user']['Row'] | null;
  loading: boolean;
  error: Error | null;
  signInTenant: (credentials: SignInTenantCredentials) => Promise<{ session: Session | null; user: User | null; error: any }>;
  signUpTenant: (credentials: SignUpTenantCredentials) => Promise<{ user: User | null; tenant: Database['public']['Tables']['tenant']['Row'] | null; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log("AuthProvider: Initializing");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Database['public']['Tables']['user']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("AuthProvider: useEffect for getInitialSession and onAuthStateChange triggered");
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), ms)
        ),
      ]);
    };

    const getInitialSession = async () => {
      console.log("AuthProvider: getInitialSession started");
      setLoading(true);
      setAuthError(null);
      try {
        const { data: { session: initialSession }, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          10000
        );
        console.log("AuthProvider: getInitialSession - supabase.auth.getSession returned", { initialSession, sessionError });
        if (sessionError) throw sessionError;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          console.log("AuthProvider: getInitialSession - User found, about to call fetchUserProfile for user:", initialSession.user.id);
          await fetchUserProfile(initialSession.user.id);
        } else {
          console.log("AuthProvider: getInitialSession - No user found in initial session");
          setUserProfile(null);
        }
      } catch (e: any) {
        console.error("AuthProvider: ERROR in getInitialSession", e);
        setAuthError(e instanceof Error ? e : new Error(String(e)));
        setUser(null);
        setSession(null);
        setUserProfile(null);
      } finally {
        console.log("AuthProvider: getInitialSession finally block");
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log(`AuthProvider: onAuthStateChange event: ${_event}, currentSession:`, currentSession);
      setLoading(true); 
      setAuthError(null);
      try {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          console.log("AuthProvider: onAuthStateChange - User found, about to call fetchUserProfile for user:", currentSession.user.id);
          await fetchUserProfile(currentSession.user.id);
        } else {
          console.log("AuthProvider: onAuthStateChange - No user in current session");
          setUserProfile(null);
        }
      } catch (e: any) {
        console.error("AuthProvider: ERROR in onAuthStateChange handler", e);
        setAuthError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        console.log("AuthProvider: onAuthStateChange finally block");
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthProvider: Unsubscribing from onAuthStateChange");
      authListener?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUserId: string) => {
    console.log("AuthProvider: fetchUserProfile called for authUserId:", authUserId);
    if (!authUserId) {
      console.log("AuthProvider: fetchUserProfile - No authUserId provided, setting userProfile to null");
      setUserProfile(null);
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('user')
        .select('*') 
        .eq('supabase_auth_user_id', authUserId)
        .maybeSingle();
      
      console.log("AuthProvider: fetchUserProfile - Supabase response:", { data, fetchError });

      if (fetchError) {
        console.error('AuthProvider: ERROR fetching user profile:', fetchError);
        setAuthError(fetchError);
        setUserProfile(null);
        return;
      }
      
      setUserProfile(data);
      console.log("AuthProvider: fetchUserProfile - User profile set to:", data);
    } catch (e: any) {
      console.error('AuthProvider: ERROR fetching user profile:', e);
      setAuthError(e instanceof Error ? e : new Error(String(e)));
      setUserProfile(null);
    }
  };

  const handleSignInTenant = async (credentials: SignInTenantCredentials) => {
    console.log("AuthProvider: handleSignInTenant called");
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInTenant(credentials);
      console.log("AuthProvider: handleSignInTenant - signInTenant result:", result);
      if (result.error) throw result.error;
      return result;
    } catch (e: any) {
      console.error("AuthProvider: ERROR in handleSignInTenant", e);
      setAuthError(e instanceof Error ? e : new Error(String(e)));
      return { session: null, user: null, error: e };
    } finally {
      setLoading(false); 
    }
  };

  const handleSignUpTenant = async (credentials: SignUpTenantCredentials) => {
    console.log("AuthProvider: handleSignUpTenant called");
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signUpTenant(credentials);
      console.log("AuthProvider: handleSignUpTenant - signUpTenant result:", result);
      if (result.error) throw result.error; 
      return result;
    } catch (e: any) {
      console.error("AuthProvider: ERROR in handleSignUpTenant", e);
      setAuthError(e instanceof Error ? e : new Error(String(e)));
      return { user: null, tenant: null, error: e }; 
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log("AuthProvider: handleSignOut called");
    setLoading(true);
    setAuthError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      console.log("AuthProvider: handleSignOut - signOut result:", { signOutError });
      if (signOutError) throw signOutError;
    } catch (e: any) {
      console.error('AuthProvider: ERROR signing out:', e);
      setAuthError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    error: authError,
    signInTenant: handleSignInTenant, 
    signUpTenant: handleSignUpTenant, 
    signOut: handleSignOut, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
