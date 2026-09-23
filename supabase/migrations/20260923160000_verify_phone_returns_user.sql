-- verify_phone מחזירה גם את user_id — הבוט רושם אותו בגיליון הלקוחות,
-- וכך לקוח בוואטסאפ מקושר לחשבון שלו באתר.
create or replace function public.verify_phone(p_phone text, p_code text)
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
    return jsonb_build_object('status', 'phone_changed');
  end if;

  return jsonb_build_object('status', 'verified', 'name', v_name, 'user_id', v_request.user_id);
end;
$$;

-- create or replace שומר את ההרשאות הקיימות, אבל מוודאים
revoke execute on function public.verify_phone(text, text) from public, anon, authenticated;
grant execute on function public.verify_phone(text, text) to service_role;
