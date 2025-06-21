-- Migration: Add user_preferences table
-- Description: Stores user-specific preferences for notifications, display, mobile, security settings

CREATE TABLE public.user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Notification preferences
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT false,
  notifications_sms BOOLEAN DEFAULT false,
  notifications_test_reminders BOOLEAN DEFAULT true,
  notifications_report_ready BOOLEAN DEFAULT true,
  notifications_system_updates BOOLEAN DEFAULT false,
  
  -- Display preferences
  display_theme VARCHAR(20) DEFAULT 'light' CHECK (display_theme IN ('light', 'dark', 'system')),
  display_language VARCHAR(10) DEFAULT 'en-US',
  display_timezone VARCHAR(50) DEFAULT 'America/New_York',
  display_date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY' CHECK (display_date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
  
  -- Mobile app preferences
  mobile_offline_sync BOOLEAN DEFAULT true,
  mobile_auto_photo_upload BOOLEAN DEFAULT true,
  mobile_gps_accuracy VARCHAR(10) DEFAULT 'high' CHECK (mobile_gps_accuracy IN ('high', 'medium', 'low')),
  mobile_camera_quality VARCHAR(10) DEFAULT 'high' CHECK (mobile_camera_quality IN ('high', 'medium', 'low')),
  
  -- Security preferences
  security_session_timeout VARCHAR(10) DEFAULT '8h' CHECK (security_session_timeout IN ('1h', '4h', '8h', '24h')),
  security_require_two_factor BOOLEAN DEFAULT false,
  security_password_expiry VARCHAR(10) DEFAULT '90d' CHECK (security_password_expiry IN ('30d', '90d', '180d', 'never')),
  
  UNIQUE(user_id)
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.user 
      WHERE supabase_auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM public.user 
      WHERE supabase_auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM public.user 
      WHERE supabase_auth_user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON public.user_preferences TO authenticated;
GRANT USAGE ON SEQUENCE user_preferences_id_seq TO authenticated; 