-- SMART WASTE MONITOR DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. Create Locations Table
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  building text not null,
  description text,
  current_status text not null default 'normal' check (current_status in ('normal', 'attention', 'critical')),
  last_checked timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on locations
alter table public.locations enable row level security;

-- Locations Policies
create policy "Locations are viewable by authenticated users"
  on public.locations for select
  to authenticated
  using (true);

create policy "Admins can insert locations"
  on public.locations for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Staff and Admins can update locations"
  on public.locations for update
  to authenticated
  using (true); -- updates allowed for status changes

create policy "Admins can delete locations"
  on public.locations for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. Create Waste Updates Table
create table public.waste_updates (
  id uuid default gen_random_uuid() primary key,
  location_id uuid references public.locations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null not null,
  status text not null check (status in ('normal', 'attention', 'critical')),
  observation text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on waste_updates
alter table public.waste_updates enable row level security;

-- Waste Updates Policies
create policy "Updates are viewable by authenticated users"
  on public.waste_updates for select
  to authenticated
  using (true);

create policy "Staff and Admins can insert updates"
  on public.waste_updates for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 4. Create Alerts Table
create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  location_id uuid references public.locations(id) on delete cascade not null,
  update_id uuid references public.waste_updates(id) on delete cascade not null,
  severity text not null check (severity in ('Low', 'Medium', 'High')),
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  resolved_by uuid references public.profiles(id) on delete set null
);

-- Enable RLS on alerts
alter table public.alerts enable row level security;

-- Alerts Policies
create policy "Alerts are viewable by authenticated users"
  on public.alerts for select
  to authenticated
  using (true);

create policy "Staff and Admins can update/resolve alerts"
  on public.alerts for update
  to authenticated
  using (true);

create policy "System/Admin can insert alerts"
  on public.alerts for insert
  to authenticated
  with check (true);

-- Trigger to automatically create a profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed Sample Locations
insert into public.locations (name, building, description, current_status) values
('Main Canteen Area', 'Zone A - Student Center', 'Main dining hall waste bins. High volume area.', 'normal'),
('Engineering Block B Lobby', 'Zone B - Engineering', 'Recycling and trash bins near the main elevator.', 'attention'),
('Central Library Entrance', 'Zone A - Academic', 'Lobby trash bins near the security desk.', 'normal'),
('Sports Complex Cafeteria', 'Zone C - Sports', 'Food court bins near outdoor tennis courts.', 'critical'),
('Science Lab Courtyard', 'Zone B - Science', 'Compost and waste disposal bins outside Biology wing.', 'normal');

