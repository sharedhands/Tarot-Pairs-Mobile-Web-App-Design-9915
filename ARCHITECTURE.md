# Tarot Pairs Architecture

## Status

This document defines the target Phase 1 architecture for migrating Tarot Pairs
from a browser-local React/Vite prototype to a Supabase-backed private-beta SaaS
application.

Phase 1 is architectural foundation work. It establishes database shape,
authentication, authorization, data-access boundaries, and migration order. It
does not implement Stripe, OpenAI, mobile apps, or new frontend product
features.

## Deployment Architecture

Tarot Pairs will be deployed into an existing Supabase project that already
contains the working Social Intuition Test (SIT) application. SIT must not be
modified, migrated, or refactored as part of Tarot Pairs work.

Tarot Pairs uses a dedicated PostgreSQL schema:

```sql
create schema if not exists tarot_pairs;
```

Rules for this shared-project deployment:

- Do not place Tarot Pairs tables in `public`.
- Do not rename, move, or alter SIT tables.
- Do not assume ownership of the `public` schema.
- Fully qualify Tarot-owned tables, foreign keys, indexes, functions, triggers,
  policies, and seed data with the `tarot_pairs` schema.
- Use the existing Supabase Auth system, `auth.users`.
- Tarot-owned user/profile tables reference `auth.users(id)`.
- Use Tarot-specific names for functions, triggers, policies, storage buckets,
  Edge Functions, cron jobs, and background processes.
- Prefer prefixes such as `tp_`, `tarot_pairs_`, and `tarot-pairs-`.
- Future apps in the same Supabase project should use their own schemas, for
  example `heartbeat_directory`, `tradevet`, or other app-specific schemas.

This makes Tarot Pairs removable later with a controlled `drop schema
tarot_pairs cascade` after confirming no shared objects depend on it.

### Shared Objects

Shared authentication remains in `auth.users`. Optional cross-app structures,
such as shared global profiles or app memberships, may live outside the Tarot
schema in a future platform layer. They are not required for private beta.

If a shared membership model is added later, it should be app-scoped, for
example:

```text
app_memberships(user_id, app_key, role, status)
```

Until then, Tarot Pairs keeps app-local `tarot_pairs.profiles` and
`tarot_pairs.subscription_status` rows.

### Supabase API Exposure

Supabase only exposes selected schemas through the generated REST/PostgREST API.
If the React app or repositories need direct Supabase client access to
`tarot_pairs` tables or RPC functions, the Supabase dashboard must expose the
`tarot_pairs` schema in API settings.

Frontend access should explicitly target the schema, for example:

```js
supabase.schema('tarot_pairs').from('readings')
supabase.schema('tarot_pairs').rpc('tp_get_active_pair_by_cards', {
  card_a_id,
  card_b_id,
})
```

Do not set global assumptions that would route SIT queries through
`tarot_pairs`. Tarot repositories should own this schema selection.

### Storage And Background Naming

No storage buckets, Edge Functions, cron jobs, or background workers are part of
this Phase 1 migration. If added later, use app-specific names such as:

- Storage bucket: `tarot-pairs-imports`
- Edge Function: `tarot-pairs-import-csv`
- Edge Function: `tarot-pairs-ai-expand`
- Cron/background job: `tarot_pairs_activate_dataset`

Do not reuse generic names that could collide with SIT or future apps.

## Product Direction

Tarot Pairs is a paid SaaS app and possible future mobile app. The private beta
should support:

- Accounts
- Pair-based readings
- Saved reading history
- Notes
- Tags
- Favorites
- Daily draws
- Admin CSV import of tarot pair meanings
- Payment/subscription stubs for later Stripe or equivalent integration
- Future premium or credit-based AI expansions

The app is not merely a lookup tool for two-card meanings. It is a complete
pair-based tarot reading system.

In this system, a traditional spread position is replaced by one tarot pair. A
normal three-card Past / Present / Future spread becomes a six-card reading:

```text
Past     = Card A + Card B
Present  = Card C + Card D
Future   = Card E + Card F
```

Each reading may contain multiple positions. Each position contains one tarot
pair. Each tarot pair consists of two cards and an authoritative stored
interpretation.

## Product Principles

- The 3,003 stored tarot pair meanings are core intellectual property.
- Stored pair meanings are the authoritative source for pair interpretation.
- A tarot pair is unordered. Card A plus Card B is the same pair as Card B plus
  Card A.
- Pair meanings are imported as datasets so the complete interpretation corpus
  can be replaced later with an improved version.
- Existing readings should remain understandable after a dataset replacement.
- CSV import is sufficient for private beta.
- Daily draws are random per user per day.
- Premium authorization must be enforced by the backend, not hidden frontend UI.
- Future AI-expanded interpretations must be grounded in an authoritative stored
  pair meaning.
- AI-expanded interpretations are future premium or credit-based features only.
- Premium users should eventually be able to ask a question before receiving an
  expanded AI interpretation.
- The frontend must never call OpenAI directly or contain provider secrets.
- React components should not know Supabase query details.

## Current Architecture

The current application is a frontend-only React 18 single-page application:

- Vite for development and production builds
- React Router with `HashRouter`
- Tailwind CSS and custom CSS
- Framer Motion and React Icons
- React Context for authentication, roles, user activity, and pair data
- Browser `localStorage` for all persistent state
- Hardcoded sample data, curated pairs, mock users, and mock analytics
- CSV parsing and content management in the browser

The current provider hierarchy is:

```text
AuthProvider
  RoleProvider
    UserProvider
      PairDataProvider
        Router
          Pages
```

Supabase is listed as a dependency, but there is currently no Supabase client,
schema, migration, RLS policy, Edge Function, or query code in the app.

### Current Runtime Data Sources

| Data | Current source |
| --- | --- |
| Tarot cards | `src/data/tarotCards.js` |
| Sample pair meanings | `src/data/pairMeanings.js` |
| Curated pairs | `src/data/pairMeanings.js` |
| Uploaded pair meanings | `localStorage.tarotPairs` |
| Authentication session | `localStorage.tarotUser` |
| Favorites | `localStorage.favorites_{userId}` |
| Daily draws | `localStorage.dailyDraw_{userId}` |
| Users and analytics | Hardcoded page data |
| Notes | Not implemented |
| Tags | Not implemented |
| Multi-position readings | Not implemented |

## Current Product Concepts In The Code

### Cards

The full 78-card deck exists in `src/data/tarotCards.js`. Cards have numeric
IDs, names, arcana, suits, and display helpers.

### Pairs

Pair meanings appear as sample data, curated data, uploaded CSV data, and random
generated fallback meanings. Current pair IDs are order-sensitive strings such
as `0-21`, while lookup logic treats reversed order as equivalent.

### Readings

Readings are not currently modeled. The current app has pair lookup and daily
draws. Phase 1 must introduce readings and reading positions as first-class
entities.

### Daily Draws

Daily draw currently generates one random pair per user per day and stores it in
localStorage.

### Favorites

Favorites exist for pair results. The current implementation stores embedded
pair snapshots and overwrites pair IDs with timestamp IDs, which creates a
favorite toggle identity bug.

### Notes And Tags

Notes and tags are not present in the current codebase.

### Admin Tools

The content management screen supports browser-local CSV import/export and
manual add/edit/delete of pair meanings. User management and dashboard screens
use mock data.

### Premium And Subscriptions

The upgrade screen describes premium access and Stripe, but premium status is
currently a client-side localStorage mutation. There is no billing integration.

## Target Domain Model

### Profile

Application-specific user profile linked one-to-one with a Supabase Auth user.

### Role

Operational authorization level. Private beta needs at least `user` and
`admin`. Premium is not a role.

### Subscription Entitlement

Server-controlled commercial entitlement. This starts as a payment stub and can
later be connected to Stripe or another provider.

### Tarot Card

One of the canonical 78 cards.

### Tarot Pair Dataset

A complete imported interpretation corpus. The initial 3,003 pair meanings are
imported into a dataset. Later improved meanings are imported into a new dataset
and activated transactionally.

### Tarot Pair

One pair interpretation within one dataset. A pair is identified by canonical
low/high card IDs and has one authoritative stored meaning for that dataset.

### Spread Template

A reusable reading layout such as Daily Pair or Past / Present / Future. Each
template has ordered positions.

### Reading

A saved user reading. A reading has one or more positions and may include a
question, title, type, and status.

### Reading Position

One position in a reading. Each position contains one tarot pair, meaning two
cards and an authoritative interpretation snapshot.

### Reading Note

User-authored note attached to a reading or a specific reading position.

### Reading Tag

User-owned label assignable to readings.

### Favorite

A user-owned saved reference to a pair or reading.

### Daily Draw

A once-per-user-per-day random draw. For beta, daily draw should be modeled as a
one-position reading so it uses the same reading infrastructure.

### AI Expansion Request

Future premium/credit-based record of a user's request for an AI-expanded
interpretation, grounded in a stored pair meaning.

## Supabase Schema

Schema changes must be implemented as version-controlled SQL migrations under
`supabase/migrations/`. Tarot-owned database objects live in the
`tarot_pairs` schema.

The examples below describe intended columns and constraints. Exact SQL is an
implementation deliverable.

### `tarot_pairs.profiles`

```text
id               uuid primary key references auth.users(id)
display_name     text nullable
email            text nullable
role             tarot_pairs.tp_profile_role not null default 'user'
account_status   tarot_pairs.tp_account_status not null default 'active'
timezone         text nullable
created_at       timestamptz not null
updated_at       timestamptz not null
```

Required enums:

```text
tp_profile_role: user, admin
tp_account_status: active, suspended, deleted
```

For private beta, a profile role field is enough. A separate roles table can be
added later if role management becomes more complex.

### `tarot_pairs.subscription_status`

Payment/subscription stub for later Stripe or equivalent integration.

```text
user_id                       uuid primary key references tarot_pairs.profiles(id)
plan                          tarot_pairs.tp_subscription_plan not null default 'free'
status                        tarot_pairs.tp_subscription_state not null default 'inactive'
provider                      text nullable
provider_customer_id          text nullable
provider_subscription_id      text nullable
current_period_end            timestamptz nullable
cancel_at_period_end          boolean not null default false
credits_balance               integer not null default 0
updated_at                    timestamptz not null
```

Required enums:

```text
tp_subscription_plan: free, premium
tp_subscription_state: inactive, trialing, active, past_due, canceled
```

Only trusted backend code or admin operations may mutate this table.

### `tarot_pairs.tarot_cards`

```text
id              smallint primary key
name            text unique not null
slug            text unique not null
arcana          text not null
suit            text not null
rank            text nullable
display_order   smallint not null
created_at      timestamptz not null
updated_at      timestamptz not null
```

Constraints must limit IDs to the canonical deck range and validate known
arcana and suit values.

### `tarot_pairs.tarot_pair_datasets`

```text
id                 uuid primary key
name               text not null
version_label      text not null
status             tarot_pairs.tp_dataset_status not null default 'draft'
source_filename    text nullable
source_hash        text nullable
row_count          integer not null default 0
imported_by        uuid nullable references tarot_pairs.profiles(id)
activated_at       timestamptz nullable
created_at         timestamptz not null
updated_at         timestamptz not null
```

Required enum:

```text
tp_dataset_status: draft, active, archived, failed
```

Only one dataset should be active at a time. Enforce this at the database level
with a partial unique index where `status = 'active'`. Dataset activation must
be transactional.

### `tarot_pairs.tarot_pairs`

```text
id                         uuid primary key
dataset_id                 uuid not null references tarot_pairs.tarot_pair_datasets(id)
card_low_id                smallint not null references tarot_pairs.tarot_cards(id)
card_high_id               smallint not null references tarot_pairs.tarot_cards(id)
meaning                    text not null
keywords                   text[] not null default '{}'
theme                      text nullable
special_interpretation     text nullable
is_curated                 boolean not null default false
curated_title              text nullable
access_tier                tarot_pairs.tp_content_access_tier not null default 'free'
content_hash               text nullable
created_at                 timestamptz not null
updated_at                 timestamptz not null
```

Required constraints:

```text
card_low_id < card_high_id
unique(dataset_id, card_low_id, card_high_id)
```

Required enum:

```text
tp_content_access_tier: free, premium
```

All application and import code must canonicalize card order before lookup or
mutation.

### `tarot_pairs.spread_templates`

```text
id             uuid primary key
name           text not null
description    text nullable
is_system      boolean not null default false
created_by     uuid nullable references tarot_pairs.profiles(id)
created_at     timestamptz not null
updated_at     timestamptz not null
```

Private beta should seed at least:

- Daily Pair
- Past / Present / Future

### `tarot_pairs.spread_template_positions`

```text
id              uuid primary key
template_id     uuid not null references tarot_pairs.spread_templates(id)
position_index  integer not null
label           text not null
description     text nullable
created_at      timestamptz not null

unique(template_id, position_index)
```

Each template position represents one tarot pair.

### `tarot_pairs.readings`

```text
id                    uuid primary key
user_id               uuid not null references tarot_pairs.profiles(id)
spread_template_id    uuid nullable references tarot_pairs.spread_templates(id)
title                 text nullable
question              text nullable
reading_type          tarot_pairs.tp_reading_type not null default 'manual'
status                tarot_pairs.tp_reading_status not null default 'completed'
created_at            timestamptz not null
updated_at            timestamptz not null
archived_at           timestamptz nullable
```

Required enums:

```text
tp_reading_type: manual, daily_draw
tp_reading_status: draft, completed, archived
```

### `tarot_pairs.reading_positions`

```text
id                                  uuid primary key
reading_id                          uuid not null references tarot_pairs.readings(id)
position_index                      integer not null
label                               text not null
question                            text nullable
tarot_pair_id                       uuid not null references tarot_pairs.tarot_pairs(id)
dataset_id                          uuid not null references tarot_pairs.tarot_pair_datasets(id)
card_low_id                         smallint not null references tarot_pairs.tarot_cards(id)
card_high_id                        smallint not null references tarot_pairs.tarot_cards(id)
meaning_snapshot                    text not null
special_interpretation_snapshot     text nullable
keywords_snapshot                   text[] not null default '{}'
theme_snapshot                      text nullable
created_at                          timestamptz not null

unique(reading_id, position_index)
```

`tarot_pair_id` references the exact pair record used at the time of the
reading. `dataset_id`, `card_low_id`, and `card_high_id` are retained for easier
querying and history. `meaning_snapshot` and
`special_interpretation_snapshot` preserve the interpretation shown to the user
even if a new dataset is activated later. `question` is nullable and reserved
for future position-specific context.

### `tarot_pairs.reading_notes`

```text
id                    uuid primary key
user_id               uuid not null references tarot_pairs.profiles(id)
reading_id            uuid not null references tarot_pairs.readings(id)
reading_position_id   uuid nullable references tarot_pairs.reading_positions(id)
body                  text not null
created_at            timestamptz not null
updated_at            timestamptz not null
```

Notes may be attached to a whole reading or one reading position.

### `tarot_pairs.reading_tags`

```text
id           uuid primary key
user_id      uuid not null references tarot_pairs.profiles(id)
name         text not null
color        text nullable
created_at   timestamptz not null
updated_at   timestamptz not null
```

Add a case-insensitive uniqueness constraint per user and tag name.

### `tarot_pairs.reading_tag_assignments`

```text
reading_id   uuid not null references tarot_pairs.readings(id)
tag_id       uuid not null references tarot_pairs.reading_tags(id)
created_at   timestamptz not null

primary key(reading_id, tag_id)
```

### `tarot_pairs.favorites`

Favorites should support both pair and reading favorites. Use nullable foreign
keys plus a type check, or split into two tables later if needed.

```text
id                uuid primary key
user_id           uuid not null references tarot_pairs.profiles(id)
favorite_type     tarot_pairs.tp_favorite_type not null
tarot_pair_id     uuid nullable references tarot_pairs.tarot_pairs(id)
reading_id        uuid nullable references tarot_pairs.readings(id)
created_at        timestamptz not null
```

Required enum:

```text
tp_favorite_type: pair, reading
```

Constraints should ensure exactly one target is populated and prevent duplicate
favorites per user/target.

Required favorite target constraint:

```text
favorite_type = 'pair'
  requires tarot_pair_id is not null
  and reading_id is null

favorite_type = 'reading'
  requires reading_id is not null
  and tarot_pair_id is null
```

### `tarot_pairs.daily_draws`

Daily draw should reference a reading, so later beta features can reuse reading
history, notes, tags, and AI expansion logic.

```text
id           uuid primary key
user_id      uuid not null references tarot_pairs.profiles(id)
draw_date    date not null
reading_id   uuid not null references tarot_pairs.readings(id)
created_at   timestamptz not null

unique(user_id, draw_date)
```

The product must define whether `draw_date` is based on UTC or the user's
profile timezone.

### `tarot_pairs.content_imports`

```text
id                  uuid primary key
dataset_id          uuid nullable references tarot_pairs.tarot_pair_datasets(id)
filename            text not null
status              tarot_pairs.tp_import_status not null
row_count           integer not null default 0
accepted_count      integer not null default 0
rejected_count      integer not null default 0
validation_errors   jsonb not null default '[]'
created_by          uuid not null references tarot_pairs.profiles(id)
created_at          timestamptz not null
completed_at        timestamptz nullable
```

Required enum:

```text
tp_import_status: uploaded, validating, validated, failed, activated
```

CSV imports must validate the complete file before changing active content.

### `tarot_pairs.ai_expansion_requests`

Future premium/credit-based feature stub. Do not implement OpenAI in Phase 1.

```text
id                          uuid primary key
user_id                     uuid not null references tarot_pairs.profiles(id)
reading_id                  uuid nullable references tarot_pairs.readings(id)
reading_position_id         uuid nullable references tarot_pairs.reading_positions(id)
tarot_pair_id               uuid not null references tarot_pairs.tarot_pairs(id)
question                    text nullable
grounding_meaning_snapshot  text not null
status                      tarot_pairs.tp_ai_request_status not null default 'queued'
credits_charged             integer not null default 0
created_at                  timestamptz not null
completed_at                timestamptz nullable
```

### `tarot_pairs.ai_expansions`

```text
id             uuid primary key
request_id     uuid not null references tarot_pairs.ai_expansion_requests(id)
provider       text not null
model          text not null
response       text not null
created_at     timestamptz not null
```

AI output must remain distinct from authoritative editorial pair meanings unless
an editor deliberately reviews and imports it into a later dataset.

## Row Level Security

RLS must be enabled for every application table exposed through Supabase.

### General Rules

- React route guards improve UX but are not security boundaries.
- The public Supabase anonymous key is expected to be visible.
- Security relies on RLS, grants, database functions, and server-side service
  credentials.
- Service-role keys and third-party API keys must never enter frontend code.

### Profiles

- Users may select their own profile.
- Users may update safe personal fields such as `display_name` and `timezone`.
- Users may not update `role` or `account_status`.
- Admins may read and manage profiles.

### Subscription Status

- Users may select their own subscription status.
- Users may not insert, update, or delete subscription rows.
- Admins or service-role backend code may update subscription stubs.
- Future Stripe webhooks must use trusted server-side credentials.

### Tarot Cards

- Authenticated and anonymous users may select cards.
- Only admins may insert, update, or delete cards.

### Tarot Pair Datasets

- Admins may select all datasets.
- Normal users should only interact with active dataset content through approved
  read functions or views.
- Only admins may create draft datasets, import rows, activate a dataset, or
  archive a dataset.

### Tarot Pairs

- Avoid broad direct `select` access to all pair meaning rows.
- Users should read active pair content through functions or views that enforce
  access tier and entitlement.
- Free users may receive free meanings and locked premium metadata.
- Premium users may receive premium meanings when entitlement is valid.
- Admins may select and manage all pair rows.
- Only admins may insert, update, or delete pair rows.

Initial read functions should include:

```text
tarot_pairs.tp_get_active_pair_by_cards(card_a_id, card_b_id)
tarot_pairs.tp_get_random_active_pair()
tarot_pairs.tp_list_curated_pairs(limit, offset)
```

Administrative functions should include:

```text
tarot_pairs.tp_validate_pair_csv_import(import_id)
tarot_pairs.tp_activate_pair_dataset(dataset_id)
```

Dataset activation must be admin-only and transactional. Activation should fail
unless the target dataset contains exactly 3,003 canonical pair rows.

### Spread Templates

- Everyone may select system templates.
- Users may create, select, update, and delete their own custom templates if
  custom templates are enabled for beta.
- Admins may manage system templates.

If custom templates are not part of private beta, only seed system templates and
disable user writes.

### Readings And Reading Positions

- Users may select, insert, update, and archive their own readings.
- Users may select, insert, update, and delete positions only for their own
  readings.
- Users may not attach positions to another user's reading.
- Admin support access is an open product decision.

### Reading Notes

- Users may CRUD notes only on their own readings or reading positions.
- Admin support access is an open product decision.

### Reading Tags And Assignments

- Users may CRUD their own tags.
- Users may assign only their own tags to their own readings.

### Favorites

- Users may select, insert, and delete only their own favorites.
- Users may not favorite another user's reading unless sharing is later added.
- Duplicate favorites must be prevented by constraints.

### Daily Draws

- Users may select and insert only their own daily draw rows.
- Users may not update draw date or user ownership.
- One draw per user per day is enforced by a uniqueness constraint.
- Deletion should be restricted or treated as archive depending on product
  policy.

### Content Imports

- Admin-only select, insert, update, and activation.
- Import validation errors may be visible to admins.
- Non-admin users have no direct access.

### AI Expansion Stubs

- Users may select their own requests and expansions.
- Future request creation must occur through a backend function that checks
  premium entitlement or credits.
- Users may not insert generated responses directly.
- No frontend OpenAI calls are allowed.

## Authentication And Authorization

Supabase Auth owns:

- Registration
- Login
- Logout
- Session refresh
- Email verification
- Password reset

Tarot Pairs should not require a global trigger on `auth.users` for private
beta, because this Supabase project is shared with SIT. Instead, the app may
call a Tarot-specific profile bootstrap RPC when an authenticated user first
enters the app:

```text
tarot_pairs.tp_ensure_profile(display_name, timezone)
```

That RPC creates or refreshes:

- `tarot_pairs.profiles` row
- `tarot_pairs.subscription_status` row

This is the intended profile/subscription bootstrap path. The frontend should
call it after signup/login before loading user-owned Tarot Pairs data. The
migration intentionally does not add, replace, or depend on any `auth.users`
trigger, because auth is shared with SIT.

Private beta can later add invite-only registration, but the schema should not
depend on public launch behavior.

Recommended helper functions:

```text
tarot_pairs.tp_is_admin()
tarot_pairs.tp_has_active_subscription()
tarot_pairs.tp_has_ai_credits()
tarot_pairs.tp_can_access_pair(tarot_pair_id)
```

Do not rely only on frontend role checks or editable profile state.

The helper functions used by RLS policies, including `tarot_pairs.tp_is_admin()`,
are `SECURITY DEFINER` functions with a constrained `search_path`. In Supabase,
when these functions are owned by the migration/table owner and table-level
`FORCE ROW LEVEL SECURITY` is not enabled, their internal reads are evaluated as
the function owner rather than the calling browser user. That avoids recursive
policy evaluation when `tp_is_admin()` is called from policies on
`tarot_pairs.profiles`. If `FORCE ROW LEVEL SECURITY` is introduced later, this
assumption must be re-tested.

## Application Data Layer

React pages and presentation components should not call Supabase directly.

Proposed structure:

```text
src/
  lib/
    supabaseClient.js
    errors.js

  repositories/
    authRepository.js
    profileRepository.js
    pairRepository.js
    readingRepository.js
    favoriteRepository.js
    dailyDrawRepository.js
    adminContentRepository.js
    subscriptionRepository.js

  services/
    authService.js
    pairService.js
    readingService.js
    dailyDrawService.js
    csvImportService.js
    legacyMigrationService.js
```

### Repositories

Repositories perform narrow Supabase operations and normalize returned rows.
They do not own React state.

Because Tarot Pairs uses a non-public schema in a shared Supabase project,
repositories must explicitly select the schema:

```js
supabase.schema('tarot_pairs').from('readings')
supabase.schema('tarot_pairs').rpc('tp_get_active_pair_by_cards', {
  card_a_id,
  card_b_id,
})
```

Do not configure shared client behavior that would accidentally affect SIT
queries.

Initial repository responsibilities:

- `authRepository`: sign in, sign up, sign out, session subscription
- `profileRepository`: current profile and role/entitlement lookup
- `pairRepository`: active pair lookup, random pair, curated pair list
- `readingRepository`: reading CRUD, positions, notes, tags
- `favoriteRepository`: pair and reading favorites
- `dailyDrawRepository`: get/create daily draw
- `adminContentRepository`: import validation, dataset management
- `subscriptionRepository`: payment stub and entitlement reads

### Services

Services apply application rules:

- Canonicalize card order.
- Create reading positions from selected card pairs.
- Snapshot pair meanings into readings.
- Enforce daily draw flow.
- Map database rows to UI models.
- Map backend errors to user-safe messages.
- Coordinate one-time legacy localStorage migration.

### Contexts

Current contexts should become thin UI-facing adapters:

- `AuthContext` delegates to `authService`.
- `RoleContext` delegates to profile/entitlement reads.
- `PairDataContext` delegates to `pairService`.
- `UserContext` delegates to favorites, readings, daily draws, notes, and tags.

Keep existing component-facing APIs temporarily where useful to reduce UI churn.

## Future AI Boundary

AI integration is outside Phase 1, but its trust boundary is defined now:

```text
React frontend
  -> authenticated backend route or Supabase Edge Function
  -> verify premium/credits
  -> load authoritative stored pair meaning
  -> include user question if provided
  -> construct grounded prompt
  -> call OpenAI with server-held credential
  -> store request/response
  -> return response to user
```

AI output must be labeled as generated and remain distinct from authoritative
stored interpretations.

## Migration Sequence

### 1. Supabase Foundation

- Add Supabase environment conventions.
- Add local Supabase project structure.
- Add migrations directory.
- Add helper functions and baseline RLS.

### 2. Auth And Profiles

- Replace mock auth with Supabase Auth.
- Add profile trigger.
- Add default subscription stub row.
- Remove email-address-based admin assignment.

### 3. Cards And Pair Dataset Reads

- Seed the 78 cards.
- Add dataset and pair tables.
- Import sample CSV into a draft dataset for development.
- Later import the authoritative 3,003-pair CSV.
- Add active-dataset pair read functions.

### 4. Daily Draws

- Model daily draw as a one-position reading.
- Enforce one draw per user per day.
- Decide timezone behavior before production beta.

### 5. Readings And Reading Positions

- Add system spread templates.
- Create manual readings with one or more pair positions.
- Snapshot pair interpretation into each position.

### 6. Favorites

- Migrate from embedded localStorage favorites to database references.
- Support pair favorites and reading favorites.
- Fix identity mismatch.

### 7. Notes And Tags

- Add reading notes.
- Add user-owned tags and assignments.

### 8. Admin CSV Import

- Validate CSV into a draft dataset.
- Require exactly 3,003 canonical unique pairs for full corpus activation.
- Activate replacement datasets transactionally.
- Keep import audit trail.

### 9. Premium/Payment Stubs

- Replace client-controlled premium with backend entitlement reads.
- Stub fields for provider/customer/subscription IDs.
- Do not implement Stripe yet.

### 10. Future AI Expansion Stubs

- Add AI request/response tables.
- Define backend-only execution boundary.
- Do not implement OpenAI calls yet.

### 11. Legacy Browser Migration

For authenticated users only:

- Detect legacy favorites and daily draw keys.
- Validate stored pair/card data.
- Map to active dataset pair IDs where possible.
- Import valid records once.
- Record migration completion.
- Never import localStorage-granted roles or premium status.

## File Strategy

### Preserve As Presentation

These files should remain mostly presentation-focused:

- `src/components/Layout.jsx`
- `src/components/Header.jsx`
- `src/components/Navigation.jsx`
- `src/components/TarotCard.jsx`
- `src/components/CardSelector.jsx`
- `src/common/SafeIcon.jsx`
- `src/App.css`
- `src/index.css`
- `tailwind.config.js`

### Preserve And Refactor

These files retain useful UI but should consume new context/service contracts:

- `src/App.jsx`
- `src/pages/Home.jsx`
- `src/pages/ExplorePairs.jsx`
- `src/pages/DailyDraw.jsx`
- `src/pages/Favorites.jsx`
- `src/pages/CuratedPairs.jsx`
- `src/pages/ContentManagement.jsx`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/Upgrade.jsx`
- `src/pages/Admin.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/UserManagement.jsx`
- `src/components/PairResult.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/components/RoleGuard.jsx`
- `src/lib/csvUtils.js`

### Replace Internals

The public APIs may be preserved temporarily, but implementations should be
rewritten around services and Supabase:

- `src/context/AuthContext.jsx`
- `src/context/RoleContext.jsx`
- `src/context/UserContext.jsx`
- `src/context/PairDataContext.jsx`

### Retire As Runtime Authority

- `src/data/pairMeanings.js`
- Random generated meanings in `src/context/PairDataContext.jsx`
- localStorage persistence for auth, pairs, favorites, and daily draws
- Mock users in `src/pages/UserManagement.jsx`
- Mock dashboard metrics in `src/pages/AdminDashboard.jsx`
- Client-controlled premium upgrade in `src/context/AuthContext.jsx`

`src/data/tarotCards.js` may remain as a UI convenience, but Supabase becomes
canonical. If both copies remain, add a consistency check.

## Security Requirements

- RLS enabled on all application tables.
- Database grants deny unsafe direct access by default. Normal authenticated
  users get direct write grants only for profile bootstrap and their own
  user-owned records. Admin/content tables such as `tarot_cards`,
  `tarot_pair_datasets`, `tarot_pairs`, `content_imports`, subscription writes,
  and generated AI responses should be written through service-role code or
  narrow Tarot-specific RPCs.
- Admin/content actions require backend authorization.
- Premium pair meanings are not bulk-delivered to unauthorized users.
- Dataset activation is admin-only and transactional.
- Service-role key, Stripe secrets, and OpenAI keys remain server-side.
- CSV imports are validated before activation.
- Reading ownership is enforced in RLS.
- Future AI requests verify premium/credits server-side.

## Required Tests

Phase 1 implementation should include database-level or integration tests for:

- Profile creation on signup.
- Prevention of user role escalation.
- Prevention of client subscription mutation.
- Exactly 78 canonical cards.
- Exactly 3,003 canonical pairs for a full dataset.
- Reversed-pair duplicate rejection.
- Same-card pair rejection.
- Active dataset replacement behavior.
- Pair access for anonymous/free/premium/admin users.
- Daily draw one-per-user-per-day behavior.
- Reading ownership and position ownership.
- Reading note ownership.
- Tag ownership and assignment ownership.
- Favorite ownership and uniqueness.
- CSV validation and failed import rollback.
- Prevention of direct premium corpus access.

## Risks And Open Decisions

### Technical Risks

- Direct Supabase reads can leak premium/IP content if grants are too broad.
- Dataset replacement can break history unless positions snapshot meanings.
- Daily draw timezone rules can create duplicate or missing draws.
- Pair identity must be canonicalized consistently across imports, readings,
  favorites, and daily draws.
- Reading architecture is new and should not be bolted onto pair lookup as an
  afterthought.

### Data Risks

- The authoritative 3,003-row CSV is not in the repository.
- CSV quality, encoding, duplicate handling, and completeness are unknown.
- Improved future datasets need rollback and auditability.
- Existing localStorage data may contain generated non-authoritative meanings.

### RLS And Security Risks

- Current roles and premium status are client-controlled.
- Frontend route guards are insufficient for admin access.
- Service-role credentials must never be placed in Vite environment variables
  exposed to the browser.
- Admin import must not be authorized only by client state.

### Product Questions

- Is private beta invite-only?
- Which pair meanings are free versus premium?
- Should favorites track a specific dataset pair or a card combination across
  datasets?
- Can users create custom spread templates during beta?
- Are notes required at reading level, position level, or both?
- Should daily draw remain one pair or support larger daily spreads later?
- What should happen to old readings when a new dataset is activated?
- What credit model will future AI use?
- Should admins have support access to user readings, notes, and tags?

## Smallest Safe Coding Phase After This Plan

The smallest safe implementation phase is Supabase foundation without UI wiring:

1. Add Supabase client/environment scaffolding.
2. Add SQL migrations for profiles, subscription stubs, cards, datasets, pairs,
   spread templates, readings, notes, tags, favorites, daily draws, import
   tracking, and AI stubs.
3. Add RLS policies and helper functions.
4. Seed the 78 tarot cards.
5. Seed basic system spread templates.
6. Add CSV import validation for the current sample CSV.
7. Do not connect current UI components yet.

This creates a secure database foundation that can be tested before the saved
React/Vite presentation layer is wired to it.

## Phase 1 Completion Criteria

Phase 1 is complete when:

- Supabase schema and migrations are version controlled.
- Supabase Auth and profiles replace mock authentication in architecture.
- Operational role and premium/payment entitlement are separate.
- Tarot cards are seeded.
- Pair datasets support replacement of the interpretation corpus.
- Pair meanings are protected by grants, RLS, and narrow read functions.
- Readings and reading positions model pair-based spreads.
- Daily draw, favorites, notes, and tags have secure table designs.
- Admin CSV import has a draft/validate/activate path.
- Payment and AI boundaries are stubbed but not implemented.
- Required database/security tests are identified and ready to implement.

Billing, OpenAI integration, mobile apps, and new UI features are explicitly not
required for Phase 1 completion.
