-- supabase/migrations/002_rls_policies.sql

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_logs ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policies for devices
CREATE POLICY "Users can view all devices" ON public.devices
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage their own devices" ON public.devices
  FOR ALL USING (auth.uid() = owner_id);

-- Policies for assets
CREATE POLICY "Users can view all assets" ON public.assets
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage their own assets" ON public.assets
  FOR ALL USING (auth.uid() = owner_id);

-- Policies for playlists
CREATE POLICY "Users can view all playlists" ON public.playlists
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage their own playlists" ON public.playlists
  FOR ALL USING (auth.uid() = owner_id);

-- Policies for playlist_items
CREATE POLICY "Users can view all playlist items" ON public.playlist_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policies for schedules
CREATE POLICY "Users can view all schedules" ON public.schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage their own schedules" ON public.schedules
  FOR ALL USING (auth.uid() = owner_id);

-- Policies for schedule_items
CREATE POLICY "Users can view all schedule items" ON public.schedule_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policies for split_screens
CREATE POLICY "Users can view all split screens" ON public.split_screens
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage their own split screens" ON public.split_screens
  FOR ALL USING (auth.uid() = owner_id);

-- Policies for device_commands
CREATE POLICY "Users can view all device commands" ON public.device_commands
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policies for device_logs
CREATE POLICY "Users can view all device logs" ON public.device_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);
