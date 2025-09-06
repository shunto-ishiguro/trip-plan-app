-- travel_plansテーブル
create table travel_plans (
  id text primary key,
  title text not null,
  destination text,
  start_date date,
  end_date date,
  description text,
  image_url text,
  budget integer,
  currency text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- activitiesテーブル（旅行プランに紐づくアクティビティ用）
create table activities (
  id text primary key,
  travel_plan_id text references travel_plans(id) on delete cascade,
  title text not null,
  description text,
  date date,
  time text,
  location text,
  cost integer,
  completed boolean default false,
  category text
);
