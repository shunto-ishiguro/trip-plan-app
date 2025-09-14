alter table travel_plans add column user_id uuid references auth.users(id);
alter table activities add column user_id uuid references auth.users(id);

alter table travel_plans enable row level security;
alter table activities enable row level security;
