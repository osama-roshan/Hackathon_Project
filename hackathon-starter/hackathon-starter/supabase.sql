-- NovaWorks AI Project Manager — Supabase Schema
-- Paste this file into the Supabase SQL Editor and click Run.

create table if not exists messages (
  id bigint generated always as identity primary key,
  user_message text not null,
  ai_reply text not null,
  created_at timestamptz default now()
);
alter table messages disable row level security;

create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('ADMIN', 'MANAGER', 'AGENT')),
  specialization text,
  skills text[]
);
alter table users disable row level security;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  description text,
  manager_id text references users(id),
  deadline date not null
);
alter table projects disable row level security;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  assignee_id text references users(id),
  deadline date not null,
  estimated_hours numeric not null check (estimated_hours > 0)
);
alter table tasks disable row level security;
