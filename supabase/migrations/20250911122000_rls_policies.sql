-- ================================
-- app_users のポリシー
-- ================================

-- 自分のユーザー情報だけ閲覧可能
create policy "Users can view their own profile"
on app_users
for select
using (id = auth.uid());

-- 自分のユーザー情報だけ更新可能
create policy "Users can update their own profile"
on app_users
for update
using (id = auth.uid());

-- 自分のユーザー情報を登録可能（サインアップ時など）
create policy "Users can insert their own profile"
on app_users
for insert
with check (id = auth.uid());

-- ================================
-- travel_plans のポリシー
-- ================================

-- 自分のプランだけ閲覧可能
create policy "Users can view their own travel plans"
on travel_plans
for select
using (user_id = auth.uid());

-- 自分のプランだけ更新可能
create policy "Users can update their own travel plans"
on travel_plans
for update
using (user_id = auth.uid());

-- 自分のプランだけ削除可能
create policy "Users can delete their own travel plans"
on travel_plans
for delete
using (user_id = auth.uid());

-- 自分のプランだけ作成可能
create policy "Users can insert their own travel plans"
on travel_plans
for insert
with check (user_id = auth.uid());

-- ================================
-- activities のポリシー
-- ================================

-- 自分のプランのアクティビティだけ閲覧可能
create policy "Users can view activities from their own plans"
on activities
for select
using (
  exists (
    select 1
    from travel_plans
    where travel_plans.id = activities.plan_id
      and travel_plans.user_id = auth.uid()
  )
);

-- 自分のプランのアクティビティだけ更新可能
create policy "Users can update activities from their own plans"
on activities
for update
using (
  exists (
    select 1
    from travel_plans
    where travel_plans.id = activities.plan_id
      and travel_plans.user_id = auth.uid()
  )
);

-- 自分のプランのアクティビティだけ削除可能
create policy "Users can delete activities from their own plans"
on activities
for delete
using (
  exists (
    select 1
    from travel_plans
    where travel_plans.id = activities.plan_id
      and travel_plans.user_id = auth.uid()
  )
);

-- 自分のプランにだけアクティビティを追加可能
create policy "Users can insert activities into their own plans"
on activities
for insert
with check (
  exists (
    select 1
    from travel_plans
    where travel_plans.id = activities.plan_id
      and travel_plans.user_id = auth.uid()
  )
);