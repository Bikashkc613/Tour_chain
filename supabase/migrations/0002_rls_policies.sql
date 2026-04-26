create or replace function is_admin(uid uuid)
returns boolean
language sql
stable
as $$
    select exists (
        select 1 from users
        where id = uid and role = 'admin'
    );
$$;

alter table users enable row level security;
alter table guides enable row level security;
alter table places enable row level security;
alter table routes enable row level security;
alter table route_checkpoints enable row level security;
alter table quests enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;
alter table check_ins enable row level security;
alter table reviews enable row level security;
alter table disputes enable row level security;
alter table completion_proofs enable row level security;

create policy "users_public_select" on users for select using (true);
create policy "users_self_update" on users for update using (auth.uid() = id);

create policy "guides_public_select" on guides for select using (true);
create policy "guides_self_or_admin_insert" on guides for insert with check (auth.uid() = user_id or is_admin(auth.uid()));
create policy "guides_self_or_admin_update" on guides for update using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "places_public_select" on places for select using (true);
create policy "places_admin_write" on places for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "routes_public_select" on routes for select using (true);
create policy "routes_admin_write" on routes for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "route_checkpoints_public_select" on route_checkpoints for select using (true);
create policy "route_checkpoints_admin_write" on route_checkpoints for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "quests_public_select" on quests for select using (true);
create policy "quests_admin_write" on quests for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "services_public_select" on services for select using (true);
create policy "services_guide_owner_insert" on services for insert with check (
    exists (
        select 1 from guides g
        where g.id = services.guide_id and g.user_id = auth.uid()
    ) or is_admin(auth.uid())
);
create policy "services_guide_owner_update" on services for update using (
    exists (
        select 1 from guides g
        where g.id = services.guide_id and g.user_id = auth.uid()
    ) or is_admin(auth.uid())
);

create policy "bookings_participants_or_admin_select" on bookings for select using (
    auth.uid() = tourist_id
    or exists (select 1 from guides g where g.id = bookings.guide_id and g.user_id = auth.uid())
    or is_admin(auth.uid())
);
create policy "bookings_tourist_insert" on bookings for insert with check (auth.uid() = tourist_id);
create policy "bookings_participants_update" on bookings for update using (
    auth.uid() = tourist_id
    or exists (select 1 from guides g where g.id = bookings.guide_id and g.user_id = auth.uid())
    or is_admin(auth.uid())
);

create policy "checkins_booking_participants_select" on check_ins for select using (
    exists (
        select 1
        from bookings b
        left join guides g on g.id = b.guide_id
        where b.id = check_ins.booking_id
        and (auth.uid() = b.tourist_id or auth.uid() = g.user_id or is_admin(auth.uid()))
    )
);
create policy "checkins_booking_participants_insert" on check_ins for insert with check (
    exists (
        select 1
        from bookings b
        left join guides g on g.id = b.guide_id
        where b.id = check_ins.booking_id
        and (auth.uid() = b.tourist_id or auth.uid() = g.user_id or is_admin(auth.uid()))
    )
);

create policy "reviews_public_select" on reviews for select using (true);
create policy "reviews_completed_reviewer_insert" on reviews for insert with check (
    auth.uid() = reviewer_id
    and exists (
        select 1 from bookings b
        where b.id = reviews.booking_id
          and b.status = 'completed'
    )
);

create policy "disputes_filer_or_admin_select" on disputes for select using (
    auth.uid() = filed_by or is_admin(auth.uid())
);
create policy "disputes_filer_insert" on disputes for insert with check (
    auth.uid() = filed_by
);
create policy "disputes_admin_update" on disputes for update using (
    is_admin(auth.uid())
);

create policy "completion_proofs_public_select" on completion_proofs for select using (true);
create policy "completion_proofs_service_role_insert" on completion_proofs for insert
with check (auth.role() = 'service_role' or is_admin(auth.uid()));
