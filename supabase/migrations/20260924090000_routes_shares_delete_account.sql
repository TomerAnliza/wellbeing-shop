-- ════════════════════════════════════════════════════════════════════
-- מסלול GPS, שיתוף אימון ומחיקת חשבון
-- אפיון: docs/spec-gps-map-share.md
-- ════════════════════════════════════════════════════════════════════


-- ─── המסלול ומקור המרחק ──────────────────────────────────────────────
-- route: מערך קטעים, בכל קטע נקודות [lat, lng, seconds]. null = אין מסלול.
-- ה-RLS של activities לא משתנה: המסלול גלוי רק לבעלים.
alter table public.activities
  add column route jsonb,
  add column distance_source text not null default 'estimated'
    check (distance_source in ('estimated', 'gps'));


-- ─── שיתוף ────────────────────────────────────────────────────────────
-- public_route: עותק של המסלול, **בלי 200 המטרים הראשונים והאחרונים** (אזור פרטיות).
-- נשמר ברגע השיתוף — כך הקישור הציבורי אף פעם לא חושף את המסלול המלא.
create table public.activity_shares (
  token        text primary key,
  activity_id  uuid not null unique references public.activities (id) on delete cascade,
  user_id      uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  public_route jsonb,
  created_at   timestamptz not null default now()
);

alter table public.activity_shares enable row level security;

-- הבעלים רואה את השיתופים שלו ומבטל אותם. יצירה — רק דרך share_activity
create policy "shares: read own" on public.activity_shares
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "shares: delete own" on public.activity_shares
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.activity_shares from anon, authenticated;
grant select, delete on public.activity_shares to authenticated;


-- שיתוף אימון: רק של המשתמש עצמו. מחזיר את האסימון הקיים, או יוצר חדש.
-- p_public_route — המסלול החתוך, שהשרת של האתר חישב (lib/geo.ts)
create function public.share_activity(p_activity uuid, p_public_route jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  uuid := auth.uid();
  v_token text;
begin
  if not exists (select 1 from public.activities where id = p_activity and user_id = v_user) then
    raise exception 'not your activity';
  end if;

  select token into v_token from public.activity_shares where activity_id = p_activity;
  if v_token is not null then
    return v_token;
  end if;

  -- 16 בייטים אקראיים, base64 שמתאים לכתובת (בלי + / =)
  v_token := translate(encode(extensions.gen_random_bytes(16), 'base64'), '+/=', '-_');
  insert into public.activity_shares (token, activity_id, user_id, public_route)
  values (v_token, p_activity, v_user, p_public_route);
  return v_token;
end;
$$;

revoke execute on function public.share_activity(uuid, jsonb) from public, anon;
grant execute on function public.share_activity(uuid, jsonb) to authenticated;


-- הקישור הציבורי: רק השדות שמותר להציג (docs/spec-gps-map-share.md, "מה מוצג בקישור").
-- תאריך בלי שעה, שם פרטי בלבד, המסלול החתוך בלבד. אסימון לא קיים / שיתוף שבוטל → null
create function public.get_shared_activity(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'first_name',       split_part(p.display_name, ' ', 1),
    'type',             a.type,
    'day',              (a.started_at at time zone p.timezone)::date,
    'duration_minutes', a.duration_minutes,
    'distance_km',      a.distance_km,
    'distance_source',  a.distance_source,
    'calories',         a.calories,
    'route',            s.public_route
  )
  from public.activity_shares s
  join public.activities a on a.id = s.activity_id
  join public.profiles p on p.id = a.user_id
  where s.token = p_token;
$$;

revoke execute on function public.get_shared_activity(text) from public;
grant execute on function public.get_shared_activity(text) to anon, authenticated;


-- ─── מחיקת חשבון ──────────────────────────────────────────────────────
-- מוחקת את המשתמש המחובר. ה-cascade מוחק פרופיל, אימונים, מסלולים, שיתופים וקודי אימות.
-- נתונים מחוץ ל-Supabase (גיליונות, תמונות פניות) — לא כאן. ראו /privacy
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
