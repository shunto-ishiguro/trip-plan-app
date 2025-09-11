-- app_users テーブルに RLS を有効化
alter table app_users enable row level security;

-- travel_plans テーブルに RLS を有効化
alter table travel_plans enable row level security;

-- activities テーブルに RLS を有効化
alter table activities enable row level security;