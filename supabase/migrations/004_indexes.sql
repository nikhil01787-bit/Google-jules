-- supabase/migrations/004_indexes.sql

-- Indexes for devices table
CREATE INDEX IF NOT EXISTS idx_devices_pairing_code ON public.devices(pairing_code);
CREATE INDEX IF NOT EXISTS idx_devices_uuid ON public.devices(uuid);
CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_owner_id ON public.devices(owner_id);


-- Indexes for assets table
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON public.assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON public.assets(owner_id);

-- Indexes for playlist_items table
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_playlist_items_playlist_id_position ON public.playlist_items(playlist_id, position);

-- Indexes for schedule_items table
CREATE INDEX IF NOT EXISTS idx_schedule_items_schedule_id ON public.schedule_items(schedule_id);

-- Indexes for device_commands table
CREATE INDEX IF NOT EXISTS idx_device_commands_device_id ON public.device_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_device_commands_status ON public.device_commands(status);

-- Indexes for device_logs table
CREATE INDEX IF NOT EXISTS idx_device_logs_device_id ON public.device_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_device_logs_created_at ON public.device_logs(created_at DESC);
