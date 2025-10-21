-- supabase/migrations/001_initial_schema.sql

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'document', 'website', 'app')),
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  original_filename TEXT,
  app_type TEXT,
  web_url TEXT,
  app_config JSONB,
  duration INTEGER DEFAULT 10,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists Table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_name TEXT NOT NULL,
  description TEXT,
  orientation TEXT DEFAULT 'LANDSCAPE',
  resume_on_next_play BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name TEXT NOT NULL,
  description TEXT,
  default_content_type TEXT CHECK (default_content_type IN ('asset', 'playlist', 'none')),
  default_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  default_playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devices Table
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT NOT NULL,
  pairing_code TEXT UNIQUE NOT NULL,
  uuid TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'pairing')),
  orientation TEXT DEFAULT 'LANDSCAPE' CHECK (orientation IN ('LANDSCAPE', 'PORTRAIT')),
  current_content_type TEXT CHECK (current_content_type IN ('asset', 'playlist', 'schedule', 'split_screen')),
  current_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  current_playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL,
  current_schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
  player_version TEXT,
  platform TEXT,
  last_seen_at TIMESTAMPTZ,
  ip_address TEXT,
  tags TEXT[],
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist Items Table
CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Items Table
CREATE TABLE IF NOT EXISTS public.schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('asset', 'playlist')),
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE SET NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  recurrence_type TEXT DEFAULT 'once' CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
  recurrence_days INTEGER[],
  start_date DATE,
  end_date DATE,
  event_name TEXT,
  event_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Split Screens Table
CREATE TABLE IF NOT EXISTS public.split_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_screen_name TEXT NOT NULL,
  orientation TEXT DEFAULT 'LANDSCAPE',
  zones JSONB NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device Commands Table
CREATE TABLE IF NOT EXISTS public.device_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  command_type TEXT NOT NULL CHECK (command_type IN ('push_content', 'reboot', 'update', 'sync', 'unpair')),
  command_payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed')),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device Logs Table
CREATE TABLE IF NOT EXISTS public.device_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  log_level TEXT CHECK (log_level IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
