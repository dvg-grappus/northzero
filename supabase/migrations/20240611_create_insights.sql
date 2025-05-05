create table if not exists insights (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) not null,
  type text not null, -- e.g. 'positioning'
  insight_type text not null, -- tip | opinion | warning | contradiction | praise
  message text not null,
  insight_references jsonb,
  created_at timestamptz not null default now()
); 