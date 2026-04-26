create materialized view if not exists leaderboard as
select
    u.id,
    u.display_name,
    u.avatar_url,
    u.xp,
    u.rank,
    u.total_completions,
    count(distinct ci.place_id) as unique_places_visited,
    rank() over (order by u.xp desc) as position
from users u
left join check_ins ci on ci.user_id = u.id and ci.verified = true
where u.role = 'tourist'
group by u.id
order by u.xp desc;

create unique index if not exists leaderboard_id_idx on leaderboard (id);
create index if not exists leaderboard_position_idx on leaderboard (position);

create or replace function refresh_leaderboard()
returns void
language plpgsql
security definer
as $$
begin
    refresh materialized view concurrently leaderboard;
exception
    when feature_not_supported then
        refresh materialized view leaderboard;
end;
$$;
