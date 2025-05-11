import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import {
  onAuthStateChange,
  signInTenant,
  signUpTenant,
  // Assuming these are the correct type names from your auth.ts
  type SignInTenantCredentials,
  type SignUpTenantCredentials
} from '../../integrations/supabase/auth';
import type { Database } from '../../types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  tenant: Database['public']['Tables']['tenant']['Row'] | null;
  loading: boolean;
  error: Error | null;
  // Add the new function signatures
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
  const [tenant, setTenant] = useState<Database['public']['Tables']['tenant']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("AuthProvider: useEffect for getInitialSession and onAuthStateChange triggered");
    const getInitialSession = async () => {
      console.log("AuthProvider: getInitialSession started");
      setLoading(true);
      setAuthError(null);
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        console.log("AuthProvider: getInitialSession - supabase.auth.getSession returned", { initialSession, sessionError });
        if (sessionError) throw sessionError;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          console.log("AuthProvider: getInitialSession - User found, about to call fetchTenantData for user:", initialSession.user.id);
          await fetchTenantData(initialSession.user.id);
          console.log("AuthProvider: getInitialSession - fetchTenantData completed or errored gracefully.");
        } else {
          console.log("AuthProvider: getInitialSession - No user found in initial session");
          setTenant(null);
        }
      } catch (e: any) {
        console.error("AuthProvider: ERROR in getInitialSession", e);
        setAuthError(e instanceof Error ? e : new Error(String(e)));
        setUser(null);
        setSession(null);
        setTenant(null);
      } finally {
        console.log("AuthProvider: getInitialSession finally block. Current user state:", user, "session:", session, "loading: false");
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
          console.log("AuthProvider: onAuthStateChange - User found, about to call fetchTenantData for user:", currentSession.user.id);
          await fetchTenantData(currentSession.user.id);
          console.log("AuthProvider: onAuthStateChange - fetchTenantData completed or errored gracefully.");
        } else {
          console.log("AuthProvider: onAuthStateChange - No user in current session");
          setTenant(null);
        }
      } catch (e: any) {
        console.error("AuthProvider: ERROR in onAuthStateChange handler", e);
        setAuthError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        console.log("AuthProvider: onAuthStateChange finally block. Event:", _event, "Current user state:", user, "session:", currentSession, "loading: false");
        setLoading(false);
      }
    });

    return () => {
      console.log("AuthProvider: Unsubscribing from onAuthStateChange");
      authListener?.unsubscribe();
    };
  }, []);

  const fetchTenantData = async (authUserId: string) => {
    console.log("AuthProvider: fetchTenantData called for authUserId:", authUserId);
    if (!authUserId) {
      console.log("AuthProvider: fetchTenantData - No authUserId provided, setting tenant to null");
      setTenant(null);
      console.log("AuthProvider: fetchTenantData finished (no authUserId).");
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('tenant')
        .select('id, created_at, is_active, name, plan, stripe_customer_id, supabase_auth_user_id, updated_at') 
        .eq('supabase_auth_user_id', authUserId)
        .single<Database['public']['Tables']['tenant']['Row']>(); // Explicit type for single()
      console.log("AuthProvider: fetchTenantData - Supabase response:", { data, fetchError });

      if (fetchError) throw fetchError;
      
      setTenant(data || null); // data is now typed as TenantRow | null
      console.log("AuthProvider: fetchTenantData - Tenant set to:", data);
    } catch (e: any) {
      console.error('AuthProvider: ERROR fetching tenant data:', e.message, e);
      setAuthError(e instanceof Error ? e : new Error(String(e)));
      setTenant(null);
    }
    console.log("AuthProvider: fetchTenantData finished (after try-catch).");
  };

  const handleSignInTenant = async (credentials: SignInTenantCredentials) => {
    console.log("AuthProvider: handleSignInTenant called with credentials:", credentials.email);
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
      console.log("AuthProvider: handleSignInTenant finally block. loading: false");
      setLoading(false); 
    }
  };

  const handleSignUpTenant = async (credentials: SignUpTenantCredentials) => {
    console.log("AuthProvider: handleSignUpTenant called with credentials:", credentials.email);
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
      console.log("AuthProvider: handleSignUpTenant finally block. loading: false");
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
      console.error('AuthProvider: ERROR signing out:', e.message, e);
      setAuthError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      console.log("AuthProvider: handleSignOut finally block. loading: false");
      setLoading(false);
    }
  };

  console.log("AuthProvider: value being provided to context:", { session, user, tenant, loading, authError });
  const value = {
    session,
    user,
    tenant,
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
  // console.log("useAuth: context is:", context); // Too noisy, enable if specific debugging needed
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
