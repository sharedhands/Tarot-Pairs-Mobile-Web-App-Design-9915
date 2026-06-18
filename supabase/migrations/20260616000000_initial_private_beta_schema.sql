-- Tarot Pairs private beta foundation schema.
-- Designed for a shared Supabase project that already contains SIT.
-- This migration intentionally does not modify SIT tables, does not assume
-- ownership of public schema objects, and does not implement Stripe or OpenAI.

create schema if not exists tarot_pairs;

create extension if not exists pgcrypto with schema extensions;

-- Supabase migrations are expected to run once. The enum blocks are guarded so
-- local reset/retry workflows do not fail only because a type already exists.
-- Table, policy, and trigger creation remains migration-style one-time DDL.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_profile_role'
  ) then
    create type tarot_pairs.tp_profile_role as enum ('user', 'admin');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_account_status'
  ) then
    create type tarot_pairs.tp_account_status as enum ('active', 'suspended', 'deleted');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_subscription_plan'
  ) then
    create type tarot_pairs.tp_subscription_plan as enum ('free', 'premium');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_subscription_state'
  ) then
    create type tarot_pairs.tp_subscription_state as enum ('inactive', 'trialing', 'active', 'past_due', 'canceled');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_dataset_status'
  ) then
    create type tarot_pairs.tp_dataset_status as enum ('draft', 'active', 'archived', 'failed');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_content_access_tier'
  ) then
    create type tarot_pairs.tp_content_access_tier as enum ('free', 'premium');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_reading_type'
  ) then
    create type tarot_pairs.tp_reading_type as enum ('manual', 'daily_draw');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_reading_status'
  ) then
    create type tarot_pairs.tp_reading_status as enum ('draft', 'completed', 'archived');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_favorite_type'
  ) then
    create type tarot_pairs.tp_favorite_type as enum ('pair', 'reading');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_import_status'
  ) then
    create type tarot_pairs.tp_import_status as enum ('uploaded', 'validating', 'validated', 'failed', 'activated');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'tarot_pairs'
      and t.typname = 'tp_ai_request_status'
  ) then
    create type tarot_pairs.tp_ai_request_status as enum ('queued', 'processing', 'completed', 'failed', 'canceled');
  end if;
end;
$$;

create or replace function tarot_pairs.tp_set_updated_at()
returns trigger
language plpgsql
set search_path = tarot_pairs, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table tarot_pairs.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  role tarot_pairs.tp_profile_role not null default 'user',
  account_status tarot_pairs.tp_account_status not null default 'active',
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tp_profiles_set_updated_at
before update on tarot_pairs.profiles
for each row execute function tarot_pairs.tp_set_updated_at();

create or replace function tarot_pairs.tp_is_admin()
returns boolean
language sql
stable
security definer
set search_path = tarot_pairs, pg_temp
as $$
  select exists (
    select 1
    from tarot_pairs.profiles
    where id = auth.uid()
      and role = 'admin'
      and account_status = 'active'
  );
$$;

create table tarot_pairs.subscription_status (
  user_id uuid primary key references tarot_pairs.profiles(id) on delete cascade,
  plan tarot_pairs.tp_subscription_plan not null default 'free',
  status tarot_pairs.tp_subscription_state not null default 'inactive',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  credits_balance integer not null default 0 check (credits_balance >= 0),
  updated_at timestamptz not null default now()
);

create trigger tp_subscription_status_set_updated_at
before update on tarot_pairs.subscription_status
for each row execute function tarot_pairs.tp_set_updated_at();

create or replace function tarot_pairs.tp_has_active_subscription(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = tarot_pairs, pg_temp
as $$
  select exists (
    select 1
    from tarot_pairs.subscription_status s
    join tarot_pairs.profiles p on p.id = s.user_id
    where s.user_id = $1
      and p.account_status = 'active'
      and s.plan = 'premium'
      and s.status in ('trialing', 'active')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

create or replace function tarot_pairs.tp_has_ai_credits(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = tarot_pairs, pg_temp
as $$
  select exists (
    select 1
    from tarot_pairs.subscription_status
    where subscription_status.user_id = $1
      and credits_balance > 0
  );
$$;

create or replace function tarot_pairs.tp_ensure_profile(
  display_name text default null,
  timezone text default null
)
returns tarot_pairs.profiles
language plpgsql
security definer
set search_path = tarot_pairs, pg_temp
as $$
declare
  result tarot_pairs.profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  insert into tarot_pairs.profiles (id, email, display_name, timezone)
  select
    auth.users.id,
    auth.users.email,
    coalesce($1, auth.users.raw_user_meta_data ->> 'display_name', auth.users.raw_user_meta_data ->> 'name'),
    $2
  from auth.users
  where auth.users.id = auth.uid()
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(tarot_pairs.profiles.display_name, excluded.display_name),
    timezone = coalesce(tarot_pairs.profiles.timezone, excluded.timezone)
  returning * into result;

  insert into tarot_pairs.subscription_status (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  return result;
end;
$$;

create table tarot_pairs.tarot_cards (
  id smallint primary key check (id between 0 and 77),
  name text unique not null,
  slug text unique not null,
  arcana text not null check (arcana in ('major', 'minor')),
  suit text not null check (suit in ('major', 'cups', 'wands', 'swords', 'pentacles')),
  rank text,
  display_order smallint not null check (display_order between 0 and 77),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tp_tarot_cards_set_updated_at
before update on tarot_pairs.tarot_cards
for each row execute function tarot_pairs.tp_set_updated_at();

create table tarot_pairs.tarot_pair_datasets (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  version_label text not null,
  status tarot_pairs.tp_dataset_status not null default 'draft',
  source_filename text,
  source_hash text,
  row_count integer not null default 0 check (row_count >= 0),
  imported_by uuid references tarot_pairs.profiles(id) on delete set null,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index tarot_pairs.tp_tarot_pair_datasets_one_active_idx
on tarot_pairs.tarot_pair_datasets (status)
where status = 'active';

create index tarot_pairs.tp_tarot_pair_datasets_status_idx
on tarot_pairs.tarot_pair_datasets(status);

create trigger tp_tarot_pair_datasets_set_updated_at
before update on tarot_pairs.tarot_pair_datasets
for each row execute function tarot_pairs.tp_set_updated_at();

create table tarot_pairs.tarot_pairs (
  id uuid primary key default extensions.gen_random_uuid(),
  dataset_id uuid not null references tarot_pairs.tarot_pair_datasets(id) on delete cascade,
  card_low_id smallint not null references tarot_pairs.tarot_cards(id),
  card_high_id smallint not null references tarot_pairs.tarot_cards(id),
  meaning text not null,
  keywords text[] not null default '{}',
  theme text,
  special_interpretation text,
  is_curated boolean not null default false,
  curated_title text,
  access_tier tarot_pairs.tp_content_access_tier not null default 'free',
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tp_tarot_pairs_distinct_ordered_cards_chk check (card_low_id < card_high_id),
  constraint tp_tarot_pairs_dataset_cards_unique unique (dataset_id, card_low_id, card_high_id)
);

create index tarot_pairs.tp_tarot_pairs_dataset_idx
on tarot_pairs.tarot_pairs(dataset_id);

create index tarot_pairs.tp_tarot_pairs_cards_idx
on tarot_pairs.tarot_pairs(card_low_id, card_high_id);

create index tarot_pairs.tp_tarot_pairs_access_tier_idx
on tarot_pairs.tarot_pairs(access_tier);

create index tarot_pairs.tp_tarot_pairs_curated_idx
on tarot_pairs.tarot_pairs(dataset_id, is_curated)
where is_curated = true;

create trigger tp_tarot_pairs_set_updated_at
before update on tarot_pairs.tarot_pairs
for each row execute function tarot_pairs.tp_set_updated_at();

create table tarot_pairs.spread_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  description text,
  is_system boolean not null default false,
  created_by uuid references tarot_pairs.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index tarot_pairs.tp_spread_templates_system_name_unique_idx
on tarot_pairs.spread_templates (lower(name))
where is_system = true;

create index tarot_pairs.tp_spread_templates_created_by_idx
on tarot_pairs.spread_templates(created_by);

create trigger tp_spread_templates_set_updated_at
before update on tarot_pairs.spread_templates
for each row execute function tarot_pairs.tp_set_updated_at();

create table tarot_pairs.spread_template_positions (
  id uuid primary key default extensions.gen_random_uuid(),
  template_id uuid not null references tarot_pairs.spread_templates(id) on delete cascade,
  position_index integer not null check (position_index >= 0),
  label text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint tp_spread_template_positions_template_index_unique unique (template_id, position_index)
);

create index tarot_pairs.tp_spread_template_positions_template_idx
on tarot_pairs.spread_template_positions(template_id, position_index);

create table tarot_pairs.readings (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references tarot_pairs.profiles(id) on delete cascade,
  spread_template_id uuid references tarot_pairs.spread_templates(id) on delete set null,
  title text,
  question text,
  reading_type tarot_pairs.tp_reading_type not null default 'manual',
  status tarot_pairs.tp_reading_status not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index tarot_pairs.tp_readings_user_created_idx
on tarot_pairs.readings(user_id, created_at desc);

create index tarot_pairs.tp_readings_template_idx
on tarot_pairs.readings(spread_template_id);

create index tarot_pairs.tp_readings_type_idx
on tarot_pairs.readings(reading_type);

create trigger tp_readings_set_updated_at
before update on tarot_pairs.readings
for each row execute function tarot_pairs.tp_set_updated_at();

create table tarot_pairs.reading_positions (
  id uuid primary key default extensions.gen_random_uuid(),
  reading_id uuid not null references tarot_pairs.readings(id) on delete cascade,
  position_index integer not null check (position_index >= 0),
  label text not null,
  question text,
  tarot_pair_id uuid not null references tarot_pairs.tarot_pairs(id) on delete restrict,
  dataset_id uuid not null references tarot_pairs.tarot_pair_datasets(id) on delete restrict,
  card_low_id smallint not null references tarot_pairs.tarot_cards(id),
  card_high_id smallint not null references tarot_pairs.tarot_cards(id),
  meaning_snapshot text not null,
  special_interpretation_snapshot text,
  keywords_snapshot text[] not null default '{}',
  theme_snapshot text,
  created_at timestamptz not null default now(),
  constraint tp_reading_positions_reading_index_unique unique (reading_id, position_index),
  constraint tp_reading_positions_distinct_ordered_cards_chk check (card_low_id < card_high_id)
);

create index tarot_pairs.tp_reading_positions_reading_idx
on tarot_pairs.reading_positions(reading_id, position_index);

create index tarot_pairs.tp_reading_positions_pair_idx
on tarot_pairs.reading_positions(tarot_pair_id);

create index tarot_pairs.tp_reading_positions_dataset_cards_idx
on tarot_pairs.reading_positions(dataset_id, card_low_id, card_high_id);

create table tarot_pairs.reading_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references tarot_pairs.profiles(id) on delete cascade,
  reading_id uuid not null references tarot_pairs.readings(id) on delete cascade,
  reading_position_id uuid references tarot_pairs.reading_positions(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tarot_pairs.tp_reading_notes_user_idx
on tarot_pairs.reading_notes(user_id, created_at desc);

create index tarot_pairs.tp_reading_notes_reading_idx
on tarot_pairs.reading_notes(reading_id);

create index tarot_pairs.tp_reading_notes_position_idx
on tarot_pairs.reading_notes(reading_position_id);

create trigger tp_reading_notes_set_updated_at
before update on tarot_pairs.reading_notes
for each row execute function tarot_pairs.tp_set_updated_at();

create table tarot_pairs.reading_tags (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references tarot_pairs.profiles(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index tarot_pairs.tp_reading_tags_user_name_unique_idx
on tarot_pairs.reading_tags (user_id, lower(name));

create trigger tp_reading_tags_set_updated_at
before update on tarot_pairs.reading_tags
for each row execute function tarot_pairs.tp_set_updated_at();

create table tarot_pairs.reading_tag_assignments (
  reading_id uuid not null references tarot_pairs.readings(id) on delete cascade,
  tag_id uuid not null references tarot_pairs.reading_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reading_id, tag_id)
);

create index tarot_pairs.tp_reading_tag_assignments_tag_idx
on tarot_pairs.reading_tag_assignments(tag_id);

create table tarot_pairs.favorites (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references tarot_pairs.profiles(id) on delete cascade,
  favorite_type tarot_pairs.tp_favorite_type not null,
  tarot_pair_id uuid references tarot_pairs.tarot_pairs(id) on delete cascade,
  reading_id uuid references tarot_pairs.readings(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tp_favorites_exactly_one_target_chk check (
    (
      favorite_type = 'pair'
      and tarot_pair_id is not null
      and reading_id is null
    )
    or
    (
      favorite_type = 'reading'
      and reading_id is not null
      and tarot_pair_id is null
    )
  )
);

create unique index tarot_pairs.tp_favorites_user_pair_unique_idx
on tarot_pairs.favorites(user_id, tarot_pair_id)
where favorite_type = 'pair';

create unique index tarot_pairs.tp_favorites_user_reading_unique_idx
on tarot_pairs.favorites(user_id, reading_id)
where favorite_type = 'reading';

create index tarot_pairs.tp_favorites_user_created_idx
on tarot_pairs.favorites(user_id, created_at desc);

create table tarot_pairs.daily_draws (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references tarot_pairs.profiles(id) on delete cascade,
  draw_date date not null,
  reading_id uuid not null references tarot_pairs.readings(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tp_daily_draws_user_date_unique unique (user_id, draw_date)
);

create index tarot_pairs.tp_daily_draws_user_created_idx
on tarot_pairs.daily_draws(user_id, created_at desc);

create table tarot_pairs.content_imports (
  id uuid primary key default extensions.gen_random_uuid(),
  dataset_id uuid references tarot_pairs.tarot_pair_datasets(id) on delete set null,
  filename text not null,
  status tarot_pairs.tp_import_status not null default 'uploaded',
  row_count integer not null default 0 check (row_count >= 0),
  accepted_count integer not null default 0 check (accepted_count >= 0),
  rejected_count integer not null default 0 check (rejected_count >= 0),
  validation_errors jsonb not null default '[]'::jsonb,
  created_by uuid not null references tarot_pairs.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index tarot_pairs.tp_content_imports_created_by_idx
on tarot_pairs.content_imports(created_by, created_at desc);

create index tarot_pairs.tp_content_imports_dataset_idx
on tarot_pairs.content_imports(dataset_id);

create index tarot_pairs.tp_content_imports_status_idx
on tarot_pairs.content_imports(status);

create table tarot_pairs.ai_expansion_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references tarot_pairs.profiles(id) on delete cascade,
  reading_id uuid references tarot_pairs.readings(id) on delete cascade,
  reading_position_id uuid references tarot_pairs.reading_positions(id) on delete cascade,
  tarot_pair_id uuid not null references tarot_pairs.tarot_pairs(id) on delete restrict,
  question text,
  grounding_meaning_snapshot text not null,
  status tarot_pairs.tp_ai_request_status not null default 'queued',
  credits_charged integer not null default 0 check (credits_charged >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index tarot_pairs.tp_ai_expansion_requests_user_idx
on tarot_pairs.ai_expansion_requests(user_id, created_at desc);

create index tarot_pairs.tp_ai_expansion_requests_status_idx
on tarot_pairs.ai_expansion_requests(status);

create index tarot_pairs.tp_ai_expansion_requests_pair_idx
on tarot_pairs.ai_expansion_requests(tarot_pair_id);

create table tarot_pairs.ai_expansions (
  id uuid primary key default extensions.gen_random_uuid(),
  request_id uuid not null references tarot_pairs.ai_expansion_requests(id) on delete cascade,
  provider text not null,
  model text not null,
  response text not null,
  created_at timestamptz not null default now()
);

create index tarot_pairs.tp_ai_expansions_request_idx
on tarot_pairs.ai_expansions(request_id);

create or replace function tarot_pairs.tp_can_access_pair(pair_id uuid)
returns boolean
language sql
stable
security definer
set search_path = tarot_pairs, pg_temp
as $$
  select exists (
    select 1
    from tarot_pairs.tarot_pairs p
    join tarot_pairs.tarot_pair_datasets d on d.id = p.dataset_id
    where p.id = $1
      and d.status = 'active'
      and (
        p.access_tier = 'free'
        or tarot_pairs.tp_has_active_subscription(auth.uid())
        or tarot_pairs.tp_is_admin()
      )
  );
$$;

create or replace function tarot_pairs.tp_get_active_pair_by_cards(card_a_id smallint, card_b_id smallint)
returns setof tarot_pairs.tarot_pairs
language sql
stable
security definer
set search_path = tarot_pairs, pg_temp
as $$
  select p.*
  from tarot_pairs.tarot_pairs p
  join tarot_pairs.tarot_pair_datasets d on d.id = p.dataset_id
  where d.status = 'active'
    and p.card_low_id = least($1, $2)
    and p.card_high_id = greatest($1, $2)
    and (
      p.access_tier = 'free'
      or tarot_pairs.tp_has_active_subscription(auth.uid())
      or tarot_pairs.tp_is_admin()
    );
$$;

create or replace function tarot_pairs.tp_user_owns_reading(reading_id uuid)
returns boolean
language sql
stable
security definer
set search_path = tarot_pairs, pg_temp
as $$
  select exists (
    select 1
    from tarot_pairs.readings
    where readings.id = $1
      and readings.user_id = auth.uid()
  );
$$;

create or replace function tarot_pairs.tp_user_owns_tag(tag_id uuid)
returns boolean
language sql
stable
security definer
set search_path = tarot_pairs, pg_temp
as $$
  select exists (
    select 1
    from tarot_pairs.reading_tags
    where reading_tags.id = $1
      and reading_tags.user_id = auth.uid()
  );
$$;

create or replace function tarot_pairs.tp_activate_pair_dataset(target_dataset_id uuid)
returns void
language plpgsql
security definer
set search_path = tarot_pairs, pg_temp
as $$
declare
  pair_count integer;
begin
  if not tarot_pairs.tp_is_admin() then
    raise exception 'Only Tarot Pairs admins can activate tarot pair datasets'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from tarot_pairs.tarot_pair_datasets
    where id = target_dataset_id
  ) then
    raise exception 'Tarot Pairs dataset % does not exist', target_dataset_id;
  end if;

  select count(*)
  into pair_count
  from tarot_pairs.tarot_pairs
  where dataset_id = target_dataset_id;

  if pair_count <> 3003 then
    raise exception 'Cannot activate Tarot Pairs dataset %. Expected 3003 pairs, found %',
      target_dataset_id,
      pair_count;
  end if;

  update tarot_pairs.tarot_pair_datasets
  set status = 'archived'
  where status = 'active'
    and id <> target_dataset_id;

  update tarot_pairs.tarot_pair_datasets
  set
    status = 'active',
    row_count = pair_count,
    activated_at = now()
  where id = target_dataset_id;
end;
$$;

alter table tarot_pairs.profiles enable row level security;
alter table tarot_pairs.subscription_status enable row level security;
alter table tarot_pairs.tarot_cards enable row level security;
alter table tarot_pairs.tarot_pair_datasets enable row level security;
alter table tarot_pairs.tarot_pairs enable row level security;
alter table tarot_pairs.spread_templates enable row level security;
alter table tarot_pairs.spread_template_positions enable row level security;
alter table tarot_pairs.readings enable row level security;
alter table tarot_pairs.reading_positions enable row level security;
alter table tarot_pairs.reading_notes enable row level security;
alter table tarot_pairs.reading_tags enable row level security;
alter table tarot_pairs.reading_tag_assignments enable row level security;
alter table tarot_pairs.favorites enable row level security;
alter table tarot_pairs.daily_draws enable row level security;
alter table tarot_pairs.content_imports enable row level security;
alter table tarot_pairs.ai_expansion_requests enable row level security;
alter table tarot_pairs.ai_expansions enable row level security;

create policy "tp_profiles_select_own_or_admin"
on tarot_pairs.profiles for select
using (id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_profiles_insert_own"
on tarot_pairs.profiles for insert
with check (
  id = auth.uid()
  and role = 'user'
  and account_status = 'active'
);

create policy "tp_profiles_update_own_safe_fields"
on tarot_pairs.profiles for update
using (
  id = auth.uid()
  and role = 'user'
  and account_status = 'active'
)
with check (
  id = auth.uid()
  and role = 'user'
  and account_status = 'active'
);

create policy "tp_profiles_admin_all"
on tarot_pairs.profiles for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_subscription_select_own_or_admin"
on tarot_pairs.subscription_status for select
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_subscription_admin_all"
on tarot_pairs.subscription_status for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_tarot_cards_select_all"
on tarot_pairs.tarot_cards for select
using (true);

create policy "tp_tarot_cards_admin_all"
on tarot_pairs.tarot_cards for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_datasets_select_active_or_admin"
on tarot_pairs.tarot_pair_datasets for select
using (status = 'active' or tarot_pairs.tp_is_admin());

create policy "tp_datasets_admin_all"
on tarot_pairs.tarot_pair_datasets for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_pairs_select_accessible_active_or_admin"
on tarot_pairs.tarot_pairs for select
using (
  tarot_pairs.tp_is_admin()
  or (
    exists (
      select 1
      from tarot_pairs.tarot_pair_datasets d
      where d.id = tarot_pairs.tarot_pairs.dataset_id
        and d.status = 'active'
    )
    and (
      access_tier = 'free'
      or tarot_pairs.tp_has_active_subscription(auth.uid())
    )
  )
);

create policy "tp_pairs_admin_all"
on tarot_pairs.tarot_pairs for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_spread_templates_select_system_own_or_admin"
on tarot_pairs.spread_templates for select
using (is_system = true or created_by = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_spread_templates_insert_admin"
on tarot_pairs.spread_templates for insert
with check (tarot_pairs.tp_is_admin());

create policy "tp_spread_templates_update_admin"
on tarot_pairs.spread_templates for update
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_spread_templates_delete_admin"
on tarot_pairs.spread_templates for delete
using (tarot_pairs.tp_is_admin());

create policy "tp_spread_template_positions_select_visible_template"
on tarot_pairs.spread_template_positions for select
using (
  exists (
    select 1
    from tarot_pairs.spread_templates t
    where t.id = tarot_pairs.spread_template_positions.template_id
      and (t.is_system = true or t.created_by = auth.uid() or tarot_pairs.tp_is_admin())
  )
);

create policy "tp_spread_template_positions_admin_all"
on tarot_pairs.spread_template_positions for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_readings_select_own_or_admin"
on tarot_pairs.readings for select
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_readings_insert_own"
on tarot_pairs.readings for insert
with check (user_id = auth.uid());

create policy "tp_readings_update_own_or_admin"
on tarot_pairs.readings for update
using (user_id = auth.uid() or tarot_pairs.tp_is_admin())
with check (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_readings_delete_own_or_admin"
on tarot_pairs.readings for delete
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_reading_positions_select_own_or_admin"
on tarot_pairs.reading_positions for select
using (tarot_pairs.tp_user_owns_reading(reading_id) or tarot_pairs.tp_is_admin());

create policy "tp_reading_positions_insert_own_reading"
on tarot_pairs.reading_positions for insert
with check (
  tarot_pairs.tp_user_owns_reading(reading_id)
  and tarot_pairs.tp_can_access_pair(tarot_pair_id)
  and exists (
    select 1
    from tarot_pairs.tarot_pairs p
    where p.id = tarot_pairs.reading_positions.tarot_pair_id
      and p.dataset_id = tarot_pairs.reading_positions.dataset_id
      and p.card_low_id = tarot_pairs.reading_positions.card_low_id
      and p.card_high_id = tarot_pairs.reading_positions.card_high_id
  )
);

create policy "tp_reading_positions_update_own_or_admin"
on tarot_pairs.reading_positions for update
using (tarot_pairs.tp_user_owns_reading(reading_id) or tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_user_owns_reading(reading_id) or tarot_pairs.tp_is_admin());

create policy "tp_reading_positions_delete_own_or_admin"
on tarot_pairs.reading_positions for delete
using (tarot_pairs.tp_user_owns_reading(reading_id) or tarot_pairs.tp_is_admin());

create policy "tp_reading_notes_select_own_or_admin"
on tarot_pairs.reading_notes for select
using ((user_id = auth.uid() and tarot_pairs.tp_user_owns_reading(reading_id)) or tarot_pairs.tp_is_admin());

create policy "tp_reading_notes_insert_own"
on tarot_pairs.reading_notes for insert
with check (user_id = auth.uid() and tarot_pairs.tp_user_owns_reading(reading_id));

create policy "tp_reading_notes_update_own_or_admin"
on tarot_pairs.reading_notes for update
using ((user_id = auth.uid() and tarot_pairs.tp_user_owns_reading(reading_id)) or tarot_pairs.tp_is_admin())
with check ((user_id = auth.uid() and tarot_pairs.tp_user_owns_reading(reading_id)) or tarot_pairs.tp_is_admin());

create policy "tp_reading_notes_delete_own_or_admin"
on tarot_pairs.reading_notes for delete
using ((user_id = auth.uid() and tarot_pairs.tp_user_owns_reading(reading_id)) or tarot_pairs.tp_is_admin());

create policy "tp_reading_tags_select_own_or_admin"
on tarot_pairs.reading_tags for select
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_reading_tags_insert_own"
on tarot_pairs.reading_tags for insert
with check (user_id = auth.uid());

create policy "tp_reading_tags_update_own_or_admin"
on tarot_pairs.reading_tags for update
using (user_id = auth.uid() or tarot_pairs.tp_is_admin())
with check (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_reading_tags_delete_own_or_admin"
on tarot_pairs.reading_tags for delete
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_reading_tag_assignments_select_own_or_admin"
on tarot_pairs.reading_tag_assignments for select
using (
  tarot_pairs.tp_is_admin()
  or (
    tarot_pairs.tp_user_owns_reading(reading_id)
    and tarot_pairs.tp_user_owns_tag(tag_id)
  )
);

create policy "tp_reading_tag_assignments_insert_own_reading_own_tag"
on tarot_pairs.reading_tag_assignments for insert
with check (
  tarot_pairs.tp_user_owns_reading(reading_id)
  and tarot_pairs.tp_user_owns_tag(tag_id)
);

create policy "tp_reading_tag_assignments_delete_own_reading_own_tag_or_admin"
on tarot_pairs.reading_tag_assignments for delete
using (
  tarot_pairs.tp_is_admin()
  or (
    tarot_pairs.tp_user_owns_reading(reading_id)
    and tarot_pairs.tp_user_owns_tag(tag_id)
  )
);

create policy "tp_favorites_select_own_or_admin"
on tarot_pairs.favorites for select
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_favorites_insert_own"
on tarot_pairs.favorites for insert
with check (
  user_id = auth.uid()
  and (
    (favorite_type = 'pair' and tarot_pairs.tp_can_access_pair(tarot_pair_id))
    or
    (favorite_type = 'reading' and tarot_pairs.tp_user_owns_reading(reading_id))
  )
);

create policy "tp_favorites_delete_own_or_admin"
on tarot_pairs.favorites for delete
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_daily_draws_select_own_or_admin"
on tarot_pairs.daily_draws for select
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_daily_draws_insert_own"
on tarot_pairs.daily_draws for insert
with check (
  user_id = auth.uid()
  and tarot_pairs.tp_user_owns_reading(reading_id)
  and exists (
    select 1
    from tarot_pairs.readings r
    where r.id = tarot_pairs.daily_draws.reading_id
      and r.user_id = auth.uid()
      and r.reading_type = 'daily_draw'
  )
);

create policy "tp_daily_draws_delete_admin_only"
on tarot_pairs.daily_draws for delete
using (tarot_pairs.tp_is_admin());

create policy "tp_content_imports_admin_all"
on tarot_pairs.content_imports for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_ai_expansion_requests_select_own_or_admin"
on tarot_pairs.ai_expansion_requests for select
using (user_id = auth.uid() or tarot_pairs.tp_is_admin());

create policy "tp_ai_expansion_requests_insert_own_stub"
on tarot_pairs.ai_expansion_requests for insert
with check (
  user_id = auth.uid()
  and status = 'queued'
  and tarot_pairs.tp_can_access_pair(tarot_pair_id)
  and (
    tarot_pairs.tp_has_active_subscription(auth.uid())
    or tarot_pairs.tp_has_ai_credits(auth.uid())
  )
);

create policy "tp_ai_expansion_requests_admin_all"
on tarot_pairs.ai_expansion_requests for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

create policy "tp_ai_expansions_select_own_or_admin"
on tarot_pairs.ai_expansions for select
using (
  tarot_pairs.tp_is_admin()
  or exists (
    select 1
    from tarot_pairs.ai_expansion_requests r
    where r.id = tarot_pairs.ai_expansions.request_id
      and r.user_id = auth.uid()
  )
);

create policy "tp_ai_expansions_admin_all"
on tarot_pairs.ai_expansions for all
using (tarot_pairs.tp_is_admin())
with check (tarot_pairs.tp_is_admin());

revoke all on schema tarot_pairs from public;
revoke all on all functions in schema tarot_pairs from public;

grant usage on schema tarot_pairs to anon, authenticated;

grant select on table tarot_pairs.tarot_cards to anon, authenticated;
grant select on table tarot_pairs.spread_templates to anon, authenticated;
grant select on table tarot_pairs.spread_template_positions to anon, authenticated;

grant select, insert, update on table tarot_pairs.profiles to authenticated;
grant select on table tarot_pairs.subscription_status to authenticated;
grant select on table tarot_pairs.tarot_pair_datasets to anon, authenticated;
grant select on table tarot_pairs.tarot_pairs to anon, authenticated;
grant select, insert, update, delete on table tarot_pairs.readings to authenticated;
grant select, insert, update, delete on table tarot_pairs.reading_positions to authenticated;
grant select, insert, update, delete on table tarot_pairs.reading_notes to authenticated;
grant select, insert, update, delete on table tarot_pairs.reading_tags to authenticated;
grant select, insert, delete on table tarot_pairs.reading_tag_assignments to authenticated;
grant select, insert, delete on table tarot_pairs.favorites to authenticated;
grant select, insert on table tarot_pairs.daily_draws to authenticated;
grant select, insert on table tarot_pairs.ai_expansion_requests to authenticated;
grant select on table tarot_pairs.ai_expansions to authenticated;

grant execute on function tarot_pairs.tp_ensure_profile(text, text) to authenticated;
grant execute on function tarot_pairs.tp_has_active_subscription(uuid) to authenticated;
grant execute on function tarot_pairs.tp_has_ai_credits(uuid) to authenticated;
grant execute on function tarot_pairs.tp_can_access_pair(uuid) to anon, authenticated;
grant execute on function tarot_pairs.tp_get_active_pair_by_cards(smallint, smallint) to anon, authenticated;
grant execute on function tarot_pairs.tp_activate_pair_dataset(uuid) to authenticated;

insert into tarot_pairs.tarot_cards (id, name, slug, arcana, suit, rank, display_order)
values
  (0, 'The Fool', 'the-fool', 'major', 'major', null, 0),
  (1, 'The Magician', 'the-magician', 'major', 'major', null, 1),
  (2, 'The High Priestess', 'the-high-priestess', 'major', 'major', null, 2),
  (3, 'The Empress', 'the-empress', 'major', 'major', null, 3),
  (4, 'The Emperor', 'the-emperor', 'major', 'major', null, 4),
  (5, 'The Hierophant', 'the-hierophant', 'major', 'major', null, 5),
  (6, 'The Lovers', 'the-lovers', 'major', 'major', null, 6),
  (7, 'The Chariot', 'the-chariot', 'major', 'major', null, 7),
  (8, 'Strength', 'strength', 'major', 'major', null, 8),
  (9, 'The Hermit', 'the-hermit', 'major', 'major', null, 9),
  (10, 'Wheel of Fortune', 'wheel-of-fortune', 'major', 'major', null, 10),
  (11, 'Justice', 'justice', 'major', 'major', null, 11),
  (12, 'The Hanged Man', 'the-hanged-man', 'major', 'major', null, 12),
  (13, 'Death', 'death', 'major', 'major', null, 13),
  (14, 'Temperance', 'temperance', 'major', 'major', null, 14),
  (15, 'The Devil', 'the-devil', 'major', 'major', null, 15),
  (16, 'The Tower', 'the-tower', 'major', 'major', null, 16),
  (17, 'The Star', 'the-star', 'major', 'major', null, 17),
  (18, 'The Moon', 'the-moon', 'major', 'major', null, 18),
  (19, 'The Sun', 'the-sun', 'major', 'major', null, 19),
  (20, 'Judgement', 'judgement', 'major', 'major', null, 20),
  (21, 'The World', 'the-world', 'major', 'major', null, 21),
  (22, 'Ace of Cups', 'ace-of-cups', 'minor', 'cups', 'ace', 22),
  (23, 'Two of Cups', 'two-of-cups', 'minor', 'cups', 'two', 23),
  (24, 'Three of Cups', 'three-of-cups', 'minor', 'cups', 'three', 24),
  (25, 'Four of Cups', 'four-of-cups', 'minor', 'cups', 'four', 25),
  (26, 'Five of Cups', 'five-of-cups', 'minor', 'cups', 'five', 26),
  (27, 'Six of Cups', 'six-of-cups', 'minor', 'cups', 'six', 27),
  (28, 'Seven of Cups', 'seven-of-cups', 'minor', 'cups', 'seven', 28),
  (29, 'Eight of Cups', 'eight-of-cups', 'minor', 'cups', 'eight', 29),
  (30, 'Nine of Cups', 'nine-of-cups', 'minor', 'cups', 'nine', 30),
  (31, 'Ten of Cups', 'ten-of-cups', 'minor', 'cups', 'ten', 31),
  (32, 'Page of Cups', 'page-of-cups', 'minor', 'cups', 'page', 32),
  (33, 'Knight of Cups', 'knight-of-cups', 'minor', 'cups', 'knight', 33),
  (34, 'Queen of Cups', 'queen-of-cups', 'minor', 'cups', 'queen', 34),
  (35, 'King of Cups', 'king-of-cups', 'minor', 'cups', 'king', 35),
  (36, 'Ace of Wands', 'ace-of-wands', 'minor', 'wands', 'ace', 36),
  (37, 'Two of Wands', 'two-of-wands', 'minor', 'wands', 'two', 37),
  (38, 'Three of Wands', 'three-of-wands', 'minor', 'wands', 'three', 38),
  (39, 'Four of Wands', 'four-of-wands', 'minor', 'wands', 'four', 39),
  (40, 'Five of Wands', 'five-of-wands', 'minor', 'wands', 'five', 40),
  (41, 'Six of Wands', 'six-of-wands', 'minor', 'wands', 'six', 41),
  (42, 'Seven of Wands', 'seven-of-wands', 'minor', 'wands', 'seven', 42),
  (43, 'Eight of Wands', 'eight-of-wands', 'minor', 'wands', 'eight', 43),
  (44, 'Nine of Wands', 'nine-of-wands', 'minor', 'wands', 'nine', 44),
  (45, 'Ten of Wands', 'ten-of-wands', 'minor', 'wands', 'ten', 45),
  (46, 'Page of Wands', 'page-of-wands', 'minor', 'wands', 'page', 46),
  (47, 'Knight of Wands', 'knight-of-wands', 'minor', 'wands', 'knight', 47),
  (48, 'Queen of Wands', 'queen-of-wands', 'minor', 'wands', 'queen', 48),
  (49, 'King of Wands', 'king-of-wands', 'minor', 'wands', 'king', 49),
  (50, 'Ace of Swords', 'ace-of-swords', 'minor', 'swords', 'ace', 50),
  (51, 'Two of Swords', 'two-of-swords', 'minor', 'swords', 'two', 51),
  (52, 'Three of Swords', 'three-of-swords', 'minor', 'swords', 'three', 52),
  (53, 'Four of Swords', 'four-of-swords', 'minor', 'swords', 'four', 53),
  (54, 'Five of Swords', 'five-of-swords', 'minor', 'swords', 'five', 54),
  (55, 'Six of Swords', 'six-of-swords', 'minor', 'swords', 'six', 55),
  (56, 'Seven of Swords', 'seven-of-swords', 'minor', 'swords', 'seven', 56),
  (57, 'Eight of Swords', 'eight-of-swords', 'minor', 'swords', 'eight', 57),
  (58, 'Nine of Swords', 'nine-of-swords', 'minor', 'swords', 'nine', 58),
  (59, 'Ten of Swords', 'ten-of-swords', 'minor', 'swords', 'ten', 59),
  (60, 'Page of Swords', 'page-of-swords', 'minor', 'swords', 'page', 60),
  (61, 'Knight of Swords', 'knight-of-swords', 'minor', 'swords', 'knight', 61),
  (62, 'Queen of Swords', 'queen-of-swords', 'minor', 'swords', 'queen', 62),
  (63, 'King of Swords', 'king-of-swords', 'minor', 'swords', 'king', 63),
  (64, 'Ace of Pentacles', 'ace-of-pentacles', 'minor', 'pentacles', 'ace', 64),
  (65, 'Two of Pentacles', 'two-of-pentacles', 'minor', 'pentacles', 'two', 65),
  (66, 'Three of Pentacles', 'three-of-pentacles', 'minor', 'pentacles', 'three', 66),
  (67, 'Four of Pentacles', 'four-of-pentacles', 'minor', 'pentacles', 'four', 67),
  (68, 'Five of Pentacles', 'five-of-pentacles', 'minor', 'pentacles', 'five', 68),
  (69, 'Six of Pentacles', 'six-of-pentacles', 'minor', 'pentacles', 'six', 69),
  (70, 'Seven of Pentacles', 'seven-of-pentacles', 'minor', 'pentacles', 'seven', 70),
  (71, 'Eight of Pentacles', 'eight-of-pentacles', 'minor', 'pentacles', 'eight', 71),
  (72, 'Nine of Pentacles', 'nine-of-pentacles', 'minor', 'pentacles', 'nine', 72),
  (73, 'Ten of Pentacles', 'ten-of-pentacles', 'minor', 'pentacles', 'ten', 73),
  (74, 'Page of Pentacles', 'page-of-pentacles', 'minor', 'pentacles', 'page', 74),
  (75, 'Knight of Pentacles', 'knight-of-pentacles', 'minor', 'pentacles', 'knight', 75),
  (76, 'Queen of Pentacles', 'queen-of-pentacles', 'minor', 'pentacles', 'queen', 76),
  (77, 'King of Pentacles', 'king-of-pentacles', 'minor', 'pentacles', 'king', 77)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  arcana = excluded.arcana,
  suit = excluded.suit,
  rank = excluded.rank,
  display_order = excluded.display_order;

insert into tarot_pairs.spread_templates (id, name, description, is_system)
values
  ('10000000-0000-0000-0000-000000000001', 'Daily Pair', 'A one-position daily reading using one tarot pair.', true),
  ('10000000-0000-0000-0000-000000000002', 'Past / Present / Future', 'A three-position reading where each position is represented by one tarot pair.', true),
  ('10000000-0000-0000-0000-000000000003', 'Situation / Challenge / Advice', 'A three-position guidance spread where each position is represented by one tarot pair.', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system;

insert into tarot_pairs.spread_template_positions (id, template_id, position_index, label, description)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 0, 'Daily Pair', 'The pair drawn for today.'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 0, 'Past', 'The pair representing past influences.'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 1, 'Present', 'The pair representing the present situation.'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 2, 'Future', 'The pair representing likely future movement.'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 0, 'Situation', 'The pair describing the situation.'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 1, 'Challenge', 'The pair describing the challenge.'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 2, 'Advice', 'The pair offering advice.')
on conflict (id) do update set
  template_id = excluded.template_id,
  position_index = excluded.position_index,
  label = excluded.label,
  description = excluded.description;
