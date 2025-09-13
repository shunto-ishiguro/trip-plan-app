create table travel_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- 外部キー制約は削除
  title text not null,
  destination text,
  start_date date,
  end_date date,
  description text,
  image_url text,
  budget integer,
  currency text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references travel_plans(id) on delete cascade,
  title text not null,
  description text,
  date date,
  time text,
  location text,
  cost integer,
  completed boolean default false,
  category text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
