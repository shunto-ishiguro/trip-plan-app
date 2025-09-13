create policy "Users can view their own travel plans"
on travel_plans
for select
using (user_id = auth.uid());

create policy "Users can update their own travel plans"
on travel_plans
for update
using (user_id = auth.uid());

create policy "Users can delete their own travel plans"
on travel_plans
for delete
using (user_id = auth.uid());

create policy "Users can insert their own travel plans"
on travel_plans
for insert
with check (user_id = auth.uid());


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
