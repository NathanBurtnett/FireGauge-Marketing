import { createClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase'; // Assuming your generated types are here
import { supabase } from './client'; // Import the single instance

// Tenant Sign Up
// TODO: Implement tenant sign-up:
// 1. Call supabase.auth.signUp
// 2. On success (and email confirmation if enabled), create a corresponding record in the public.tenant table.
//    - The 'name' for the tenant might come from the sign-up form or a subsequent step.
//    - The 'supabase_auth_user_id' will be user.id from the signUp result.

export interface SignUpTenantCredentials {
  email: string;
  password: string;
  tenantName: string;
  // Add any other fields required for tenant creation beyond the basics
}

export const signUpTenant = async ({ email, password, tenantName }: SignUpTenantCredentials) => {
  // Step 1: Sign up the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    // options: { data: { full_name: tenantName } } // Optionally store tenantName in auth.users.user_metadata
  });

  if (authError) {
    // Log the error, let the UI handle displaying it
    console.error('Error signing up tenant (auth):', authError.message);
    return { user: null, tenant: null, error: authError };
  }

  if (!authData.user) {
    // This case should ideally not happen if authError is null, but good to check
    // It might indicate email confirmation is required
    const message = 'Sign up successful, but no user data returned. Email confirmation might be pending.';
    console.warn(message);
    // Depending on your flow, you might want to inform the user about email confirmation
    // For now, we can't create the tenant row without a confirmed user ID typically
    // Or, if your Supabase project allows unconfirmed sign-ups to proceed, this behavior might differ.
    return { user: authData.user, tenant: null, error: { name: 'UserConfirmationPending', message } };
  }

  // Step 2: Create a corresponding record in the public.tenant table
  // Ensure the user object and ID are available. If email confirmation is enabled,
  // the user might not be fully "active" or have a session immediately.
  // The tenant creation should ideally happen AFTER email confirmation if it's enabled.
  // For simplicity here, we proceed if authData.user is present.
  // You might need a webhook or a post-confirmation step for tenant creation in a production app
  // if email confirmation is strictly enforced before tenant data is created.

  const { data: tenantData, error: tenantError } = await supabase
    .from('tenant')
    .insert([
      {
        supabase_auth_user_id: authData.user.id,
        name: tenantName,
        is_active: true, // Default to active
        // plan: 'free', // Optionally set a default plan
        // stripe_customer_id will default to null if not provided
      },
    ])
    .select('id, created_at, is_active, name, plan, stripe_customer_id, supabase_auth_user_id, updated_at')
    .single<Database['public']['Tables']['tenant']['Row']>(); // Explicit type for single()

  if (tenantError) {
    console.error("Error creating tenant record:", tenantError);
    // Log the error. Potentially, you might want to handle this by trying to delete the auth user
    // if tenant creation fails, to keep things consistent, but that adds complexity.
    // At this point, an auth user might exist without a tenant record. This needs careful handling.
    return { user: authData.user, tenant: null, error: tenantError };
  }

  // Step 3: Create a corresponding record in the public.user table
  // This is CRITICAL for the check-subscription function to work
  // Note: Using any type to bypass TypeScript type mismatch - types may need regeneration
  const { data: userData, error: userError } = await supabase
    .from('user')
    .insert([
      {
        supabase_auth_user_id: authData.user.id,
        tenant_id: tenantData.id,
        role: 'admin', // Default role for tenant creator
        username: email.split('@')[0], // Use email prefix as default username
        is_active: true,
      } as any, // Bypass type checking due to type/schema mismatch
    ])
    .select('*')
    .single();

  if (userError) {
    console.error("Error creating user record:", userError);
    // Consider rolling back the tenant creation if user creation fails
    // For now, we'll return the error but keep the tenant
    return { user: authData.user, tenant: tenantData, error: userError };
  }

  console.log("Successfully created tenant and user records:", { tenant: tenantData, user: userData });
  return { user: authData.user, tenant: tenantData, error: null };
};

// Tenant Login
// TODO: Implement tenant login using supabase.auth.signInWithPassword or OAuth methods
export interface SignInTenantCredentials {
  email: string;
  password: string;
}

export const signInTenant = async ({ email, password }: SignInTenantCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in tenant:', error.message);
    return { session: null, user: null, error };
  }

  // The AuthProvider will handle fetching tenant data upon successful sign-in via onAuthStateChange
  return { session: data.session, user: data.user, error: null };
};

// Tenant Logout
// TODO: Implement tenant logout using supabase.auth.signOut
export const signOutTenant = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out tenant:', error.message);
    // The AuthProvider's signOut also logs and handles UI state, 
    // but direct calls might also want to be aware of errors.
  }
  // No explicit return needed, or return { error } if callers need to react to it.
  return { error };
};

// Tenant Password Reset
// TODO: Implement password reset request (supabase.auth.resetPasswordForEmail)
// TODO: Implement password update (supabase.auth.updateUser) - typically on a dedicated reset page

export const requestPasswordReset = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    // redirectTo: 'http://localhost:5173/update-password', // URL of your password update page
  });

  if (error) {
    console.error('Error requesting password reset:', error.message);
  }
  // data might be null or an empty object on success, error tells the story
  return { data, error };
};

export const updateUserPassword = async (newPassword: string) => {
  // This function should be called when the user is on the page linked from the password reset email.
  // Supabase handles the token verification from the URL internally when the user lands on that page
  // and then this updateUser call (if successful) will update their password.
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error('Error updating user password:', error.message);
  }
  // data.user contains the updated user object on success
  return { user: data?.user, error };
};

// Session Management
// TODO: Implement functions to get current session/user if needed directly,
//       though onAuthStateChange in AuthProvider is usually preferred for React apps.

// Example: Get current user (primarily for use within these auth functions or server-side logic if applicable)
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Example: Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Listen to auth state changes (primarily for AuthProvider)
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}; 