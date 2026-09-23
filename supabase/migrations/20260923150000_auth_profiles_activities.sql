-- ════════════════════════════════════════════════════════════════════
-- פרופילים, אימונים ואימות טלפון — wellbeing
-- אפיון: docs/spec-auth-and-app.md
--
-- הפרויקט מוגדר בלי חשיפה אוטומטית ל-Data API, ולכן כל טבלה ופונקציה
-- מקבלות GRANT מפורש — רק מה שנדרש, ורק למי שנדרש.
-- ════════════════════════════════════════════════════════════════════


-- ─── profiles — שורה לכל משתמש ───────────────────────────────────────

create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text not null default '' check (char_length(display_name) <= 40),
  -- פורמט בינלאומי בספרות בלבד: 972501234567
  phone          text not null check (phone ~ '^[1-9][0-9]{7,14}$'),
  -- רק הבוט (service_role) מסמן טלפון כמאומת — ראו verify_phone
  phone_verified boolean not null default false,
  weekly_goal    int  not null default 5 check (weekly_goal between 3 and 7),
  units          text not null default 'metric' check (units in ('metric', 'imperial')),
  show_streak    boolean not null default true,
  timezone       text not null default 'Asia/Jerusalem',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- אותו טלפון לא יכול להיות מאומת אצל שני משתמשים.
-- מי שרק טוען למספר (לא אימת) אינו חוסם את הבעלים האמיתי.
create unique index profiles_verified_phone_key on public.profiles (phone) where phone_verified;

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- אין insert ואין delete מהאתר: השורה נוצרת בטריגר, ונמחקת עם המשתמש.
-- UPDATE רק על עמודות שהמשתמש רשאי לשנות — phone_verified לא ביניהן.
grant select on public.profiles to authenticated;
grant update (display_name, phone, weekly_goal, units, show_streak) on public.profiles to authenticated;


-- יצירת פרופיל בהרשמה: השם והטלפון מגיעים מה-metadata של signUp
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- עדכון פרופיל: updated_at, וטלפון חדש מבטל את האימות
create function public.profiles_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.phone is distinct from old.phone then
    new.phone_verified := false;
  end if;
  return new;
end;
$$;

create trigger profiles_before_update
  before update on public.profiles
  for each row execute function public.profiles_before_update();


-- ─── activities — אימון שנשמר ────────────────────────────────────────

create table public.activities (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  type             text not null check (type in ('run', 'walk', 'bike', 'swim', 'yoga', 'strength')),
  started_at       timestamptz not null,
  ended_at         timestamptz not null check (ended_at >= started_at),
  duration_minutes int  not null check (duration_minutes between 1 and 600),
  distance_km      numeric(6, 2) check (distance_km >= 0),  -- null כשאין מרחק לסוג הזה
  calories         int  not null check (calories >= 0),
  -- המדדים נגזרו מזמן, לא נמדדו. ב-MVP תמיד true
  is_estimated     boolean not null default true,
  created_at       timestamptz not null default now()
);

create index activities_user_started_idx on public.activities (user_id, started_at desc);

alter table public.activities enable row level security;

create policy "activities: read own" on public.activities
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- שמירת אימון — רק לעצמך, ורק אחרי שהטלפון אומת
create policy "activities: insert own when verified" on public.activities
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.phone_verified
    )
  );

create policy "activities: delete own" on public.activities
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- אין update: אימון שנשמר לא נערך
grant select, insert, delete on public.activities to authenticated;


-- ─── phone_verifications — קודים חד-פעמיים ───────────────────────────
-- אין גישה מהאתר בכלל: אין policies ואין grants. הגישה רק דרך שתי הפונקציות.

create table public.phone_verifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  phone      text not null,
  code       text not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

create index phone_verifications_lookup_idx on public.phone_verifications (phone, code);

alter table public.phone_verifications enable row level security;
revoke all on public.phone_verifications from anon, authenticated;


-- המשתמש המחובר מבקש קוד. קוד חי מ-15 הדקות האחרונות מוחזר שוב, במקום ליצור חדש.
create function public.start_phone_verification()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  uuid := auth.uid();
  v_phone text;
  v_code  text;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select phone into v_phone from public.profiles where id = v_user;

  select code into v_code
  from public.phone_verifications
  where user_id = v_user and phone = v_phone and used_at is null and expires_at > now()
  order by created_at desc
  limit 1;

  if v_code is null then
    -- 6 ספרות ממחולל אקראי קריפטוגרפי (random() אינו כזה)
    v_code := lpad(
      ((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text,
      6, '0');
    insert into public.phone_verifications (user_id, phone, code, expires_at)
    values (v_user, v_phone, v_code, now() + interval '15 minutes');
  end if;

  return v_code;
end;
$$;

revoke execute on function public.start_phone_verification() from public, anon;
grant execute on function public.start_phone_verification() to authenticated;


-- הבוט מאמת: הטלפון הוא השולח בוואטסאפ, והקוד הוא מה שכתב.
-- מחזיר { status, name }. status: verified / invalid / taken / phone_changed
create function public.verify_phone(p_phone text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.phone_verifications;
  v_name    text;
begin
  select * into v_request
  from public.phone_verifications
  where phone = p_phone and code = p_code and used_at is null and expires_at > now()
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  if exists (
    select 1 from public.profiles
    where phone = p_phone and phone_verified and id <> v_request.user_id
  ) then
    return jsonb_build_object('status', 'taken');
  end if;

  update public.phone_verifications set used_at = now() where id = v_request.id;

  update public.profiles
  set phone_verified = true
  where id = v_request.user_id and phone = p_phone
  returning display_name into v_name;

  if not found then
    -- המשתמש החליף טלפון אחרי שביקש את הקוד
    return jsonb_build_object('status', 'phone_changed');
  end if;

  return jsonb_build_object('status', 'verified', 'name', v_name);
end;
$$;

revoke execute on function public.verify_phone(text, text) from public, anon, authenticated;
grant execute on function public.verify_phone(text, text) to service_role;
