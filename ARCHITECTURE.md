# Tarot Pairs Architecture

## Status

This document defines the target Phase 1 architecture for migrating Tarot Pairs
from a browser-local prototype to a Supabase-backed SaaS application.

Phase 1 establishes the data, authentication, authorization, and application
service foundations. It does not add billing, AI-generated interpretations, or
new product features.

## Product Principles

- The 3,003 stored tarot pair meanings are the application's core intellectual
  property and authoritative interpretation source.
- A tarot pair is unordered. Card A plus Card B is the same pair as Card B plus
  Card A.
- Stored meanings must be versioned, auditable, and recoverable.
- Premium authorization must be enforced by the backend, not by hidden frontend
  controls.
- Future AI-expanded interpretations must be grounded in a stored pair meaning
  and kept distinct from authoritative editorial content.
- The frontend must never call OpenAI directly or contain provider secrets.
- React components should not know Supabase query details.

## Current Architecture

The current application is a frontend-only React 18 single-page application:

- Vite for development and production builds
- React Router with `HashRouter`
- Tailwind CSS and custom CSS
- React Context for authentication, roles, user activity, and pair data
- Browser `localStorage` for all persistent state
- Hardcoded sample, curated, user, and analytics data
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
schema, migration, query, or environment configuration in the repository.

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

## Domain Model

### Tarot Card

One of the canonical 78 cards in the deck. A card has a stable numeric ID,
name, arcana, suit, and display order.

### Tarot Pair

One of the 3,003 unique unordered combinations of two distinct tarot cards.
Pair identity and pair meaning are modeled separately so editorial content can
be versioned without changing references from favorites or daily draws.

### Pair Meaning

The authoritative editorial interpretation for a tarot pair. It includes the
meaning, keywords, theme, optional curated content, publication status, and
access tier.

### Profile

Application-specific data associated one-to-one with a Supabase Auth user.
Profiles contain display information and operational roles, but not mutable
client-controlled subscription entitlement.

### Favorite

A user-owned reference to an authoritative tarot pair.

### Daily Draw

A dated pair selection belonging to a user. It may preserve the meaning version
or a text snapshot so historical readings do not silently change after an
editorial update.

### Subscription

A server-controlled record of commercial entitlement. Premium is an
entitlement, not an application role.

### Content Import

An audited CSV import attempt containing validation results and execution
status.

## Supabase Schema

Schema changes must be implemented as version-controlled SQL migrations under
`supabase/migrations/`.

The examples below describe the intended columns and constraints. Exact SQL is
an implementation deliverable.

### `tarot_cards`

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

### `tarot_pairs`

```text
id                    uuid primary key
card_low_id           smallint not null references tarot_cards(id)
card_high_id          smallint not null references tarot_cards(id)
access_tier           content_access_tier not null
publication_status    publication_status not null
is_curated            boolean not null default false
curated_title         text nullable
created_by            uuid nullable references auth.users(id)
updated_by            uuid nullable references auth.users(id)
created_at            timestamptz not null
updated_at            timestamptz not null
```

Required constraints:

```text
card_low_id < card_high_id
unique(card_low_id, card_high_id)
```

Suggested enums:

```text
content_access_tier: free, premium
publication_status: draft, published, archived
```

All application and import code must canonicalize pair order before lookup or
mutation.

### `pair_meanings`

```text
pair_id                    uuid primary key references tarot_pairs(id)
meaning                    text not null
keywords                   text[] not null default '{}'
theme                      text nullable
special_interpretation     text nullable
version                    integer not null
content_hash               text not null
updated_by                 uuid nullable references auth.users(id)
published_at               timestamptz nullable
created_at                 timestamptz not null
updated_at                 timestamptz not null
```

This table contains only authoritative editorial content. AI-generated text
must never overwrite it.

### `pair_meaning_history`

```text
id                         uuid primary key
pair_id                    uuid not null references tarot_pairs(id)
version                    integer not null
meaning                    text not null
keywords                   text[] not null
theme                      text nullable
special_interpretation     text nullable
access_tier                content_access_tier not null
changed_by                 uuid nullable references auth.users(id)
change_source              text not null
import_id                  uuid nullable
created_at                 timestamptz not null
```

History should be created by a database trigger so application code cannot
bypass it. Production history is append-only.

### `profiles`

```text
id                 uuid primary key references auth.users(id)
display_name       text nullable
app_role           app_role not null default 'user'
account_status     account_status not null default 'active'
created_at         timestamptz not null
updated_at         timestamptz not null
```

Suggested roles:

```text
user, content_editor, admin
```

Suggested account states:

```text
active, suspended, deleted
```

### `subscriptions`

```text
id                         uuid primary key
user_id                    uuid not null references profiles(id)
provider                   text not null
provider_customer_id       text nullable
provider_subscription_id   text nullable
status                     subscription_status not null
current_period_end         timestamptz nullable
cancel_at_period_end       boolean not null default false
created_at                 timestamptz not null
updated_at                 timestamptz not null
```

Only trusted backend code or billing webhooks may mutate subscription state.

### `favorites`

```text
id           uuid primary key
user_id      uuid not null references profiles(id)
pair_id      uuid not null references tarot_pairs(id)
created_at   timestamptz not null

unique(user_id, pair_id)
```

### `daily_draws`

```text
id                  uuid primary key
user_id             uuid not null references profiles(id)
draw_date           date not null
pair_id             uuid not null references tarot_pairs(id)
card_low_id         smallint not null references tarot_cards(id)
card_high_id        smallint not null references tarot_cards(id)
meaning_version     integer nullable
meaning_snapshot    text nullable
created_at          timestamptz not null

unique(user_id, draw_date)
```

The product must define whether `draw_date` is based on UTC or a stored user
timezone before this table is finalized.

### `content_imports`

```text
id                  uuid primary key
filename            text not null
status              import_status not null
row_count           integer not null default 0
accepted_count      integer not null default 0
rejected_count      integer not null default 0
validation_errors   jsonb not null default '[]'
created_by          uuid not null references profiles(id)
created_at          timestamptz not null
completed_at        timestamptz nullable
```

CSV imports must validate the complete input before changing published content.
An import should execute transactionally through a protected database function
or Supabase Edge Function.

## Authentication And Authorization

### Authentication

Supabase Auth will own:

- Registration
- Login
- Logout
- Session refresh
- Email verification
- Password reset

A database trigger should create a `profiles` record when an Auth user is
created.

### Roles And Entitlements

Operational authorization and commercial entitlement are separate concepts:

- `app_role` grants administrative capabilities.
- Subscription state grants premium content access.

The frontend may use role and entitlement information to render appropriate UI,
but it is not a security boundary.

Recommended database helper functions:

```text
is_admin()
can_manage_content()
has_premium_access()
```

Frequently changing subscription state should be checked in the database
rather than relying exclusively on potentially stale JWT claims.

## Row Level Security

RLS must be enabled for every application table exposed through Supabase.

### Tarot Cards

- Anonymous and authenticated users may read.
- Only admins may insert, update, or delete.

### Tarot Pairs And Meanings

- Users may discover published pair metadata.
- Full meaning text is returned only when access rules allow it.
- Content editors and admins may read drafts.
- Only content editors and admins may create or update content.
- Normal application operations should archive rather than hard-delete content.

The frontend must not download all premium meanings and hide them with React.
Direct browser access to the core meaning table should be revoked. Meanings
should be exposed through narrow RPCs, views, or Edge Functions that enforce
publication and entitlement rules.

Initial read operations should include:

```text
get_pair_by_cards(card_a_id, card_b_id)
list_curated_pairs(limit, offset)
get_random_accessible_pair()
```

Administrative lists must use authenticated, authorized pagination rather than
loading the complete corpus into browser state.

### Profiles

- Users may read their own profile.
- Users may update only approved personal fields.
- Users cannot change their role or account status.
- Admin user management must use protected operations.

### Subscriptions

- Users may read their own entitlement state.
- Users cannot create or update subscriptions.
- Only service-role backend code and billing webhooks may mutate them.

### Favorites

Authenticated users may select, insert, and delete only rows where:

```sql
user_id = auth.uid()
```

### Daily Draws

Authenticated users may access only their own rows. Insert policies must force
`user_id = auth.uid()`. The database uniqueness constraint enforces one draw
per user per day.

### History And Imports

- Meaning history is written by trusted triggers or functions.
- Content editors and admins may read relevant history.
- Import execution is restricted to content editors and admins.
- Ordinary clients receive no direct write access.

## Application Data Layer

React pages and presentation components must not call Supabase directly.

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
    favoriteRepository.js
    dailyDrawRepository.js
    subscriptionRepository.js
    contentAdminRepository.js

  services/
    authService.js
    pairService.js
    dailyDrawService.js
    csvImportService.js
    legacyMigrationService.js

  context/
    AuthContext.jsx
    RoleContext.jsx
    PairDataContext.jsx
    UserContext.jsx
```

### Repositories

Repositories perform narrow Supabase operations and normalize returned rows.
They do not contain component state.

An initial `pairRepository` contract should include:

```text
getPairByCards(cardAId, cardBId)
listCuratedPairs(options)
getRandomPair()
listAdminPairs(options)
createPair(input)
updatePair(pairId, input)
archivePair(pairId)
```

### Services

Services coordinate application rules:

- Canonicalize card order.
- Convert database records into stable UI models.
- Coordinate multi-step workflows.
- Map backend failures to user-safe errors.
- Implement daily draw behavior.
- Orchestrate one-time legacy data migration.

### Contexts

Contexts remain UI-facing adapters during migration. They should own loading,
error, and cached UI state while delegating persistence and business rules to
services.

The existing context APIs may be preserved temporarily to reduce component
churn, but their localStorage and mock implementations will be replaced.

## Future AI Boundary

AI integration is outside Phase 1, but its trust boundary is defined now:

```text
React frontend
  -> authenticated Supabase Edge Function
  -> load authoritative pair meaning and version
  -> construct a grounded prompt
  -> call OpenAI with a server-held credential
  -> return or store the expanded interpretation
```

Future AI records should retain:

- User ID where applicable
- Pair ID
- Authoritative meaning version
- Authoritative content hash
- Model and provider
- User-supplied context
- Generated result
- Status and safety metadata
- Creation and retention timestamps

AI output must be visibly labeled and must remain distinct from authoritative
editorial content unless an editor deliberately reviews and publishes it.

## Migration Sequence

### 1. Establish Supabase Project Structure

- Add Supabase local configuration.
- Add migration and seed directories.
- Define development, staging, and production environment variables.
- Establish generated database type conventions.

### 2. Create Core Content Schema

- Create enums and core tables.
- Add canonical pair constraints and indexes.
- Add history and timestamp triggers.
- Add initial grants and RLS policies.

### 3. Import And Validate Core IP

- Obtain the authoritative 3,003-row source.
- Preserve an immutable backup outside runtime application assets.
- Normalize all pair order.
- Verify exactly 3,003 unique combinations.
- Reject missing cards, duplicate pairs, invalid fields, and empty meanings.
- Generate content hashes and an import report.
- Validate in staging before production.

The sample CSV in this repository is not the canonical corpus.

### 4. Implement Secure Pair Read Operations

- Add pair lookup, curated list, and random pair operations.
- Enforce publication and premium access server-side.
- Return an explicit unavailable or locked state instead of random meanings.
- Test anonymous, free, premium, editor, and admin behavior.

### 5. Add Authentication And Profiles

- Replace mock authentication with Supabase Auth.
- Create profiles automatically.
- Add role and entitlement helpers.
- Remove email-address-based privilege assignment.

### 6. Migrate Pair Reads

Refactor pair consumers in this order:

1. Explore pairs
2. Pair result access state
3. Curated pairs
4. Daily draw pair lookup
5. Home statistics

### 7. Migrate Content Administration

- Replace browser-wide array updates with row-level operations.
- Add version history and rollback.
- Implement transactional CSV validation and import.
- Keep exports restricted to authorized staff.

### 8. Migrate Favorites

- Store user and pair references.
- Enforce ownership and uniqueness.
- Correct the existing favorite identity mismatch.

### 9. Migrate Daily Draws

- Persist one draw per user per day.
- Apply the chosen timezone rule.
- Preserve meaning history according to the snapshot decision.

### 10. Add Subscription Foundation

- Add subscription records and entitlement helpers.
- Remove client-controlled premium upgrades.
- Defer billing-provider integration to a later phase.

### 11. Migrate Legacy Browser Data

For authenticated users only:

- Detect legacy favorites and daily draw keys.
- Validate and map stored pairs to canonical database IDs.
- Import valid records once.
- Record migration completion.
- Remove old keys only after confirmed success.

Do not import `tarotUser`, browser-assigned roles, or browser-assigned premium
status.

## File Strategy

### Preserve As Presentation

These files should require little or no architectural change:

- `src/components/Layout.jsx`
- `src/components/Header.jsx`
- `src/components/Navigation.jsx`
- `src/components/TarotCard.jsx`
- `src/common/SafeIcon.jsx`
- `src/App.css`
- `src/index.css`
- `tailwind.config.js`

### Preserve And Refactor

These files retain their presentation responsibilities but will consume new
context or service contracts:

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
- `src/components/PairResult.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/components/RoleGuard.jsx`
- `src/lib/csvUtils.js`

### Replace Internals

The public APIs may be preserved temporarily, but the implementations will be
replaced:

- `src/context/AuthContext.jsx`
- `src/context/RoleContext.jsx`
- `src/context/UserContext.jsx`
- `src/context/PairDataContext.jsx`

### Retire As Runtime Sources

- Sample and curated pair records in `src/data/pairMeanings.js`
- Random generated meanings in `src/data/pairMeanings.js` and
  `src/context/PairDataContext.jsx`
- Mock users in `src/pages/UserManagement.jsx`
- Mock metrics in `src/pages/AdminDashboard.jsx`
- Client-controlled premium upgrades in `src/context/AuthContext.jsx`

`src/data/tarotCards.js` may remain as a static UI catalog, but Supabase becomes
canonical. If both copies remain, an automated consistency test is required.

## Security Requirements

- The Supabase anonymous key may be present in frontend configuration; it is not
  a secret.
- The service-role key and all third-party provider secrets must remain
  server-side.
- RLS and database grants must deny access by default.
- Admin and content controls in React are convenience UI, not authorization.
- Premium meanings must not be bulk-delivered to unauthorized clients.
- Content changes require attribution and history.
- CSV imports must be validated and transactional.
- Production data must have independent backups and restore procedures.

## Required Tests

Phase 1 implementation should include database-level or integration tests for:

- Exactly 3,003 canonical pair combinations
- Reversed-pair duplicate rejection
- Invalid card and same-card rejection
- Meaning history creation and rollback
- Anonymous, free, premium, editor, and admin pair access
- Prevention of role escalation
- Prevention of subscription mutation by clients
- Favorite ownership and uniqueness
- Daily draw ownership and one-per-day uniqueness
- CSV validation and transaction rollback
- Prevention of direct premium corpus access

## Risks And Open Decisions

### Authoritative Corpus

The complete 3,003-row source is not present in this repository. Its location,
ownership, format, completeness, encoding, and backup process must be confirmed
before content migration.

### Free Access Rules

The product must define:

- Which meanings are free
- Whether anonymous and registered-free access differ
- Whether locked pairs reveal metadata or excerpts
- Whether curated content is always premium
- Whether free access changes over time

### Editorial Workflow

Decisions are required on:

- Immediate publication versus review and approval
- Content editor versus moderator responsibilities
- Who may restore prior versions
- Whether hard deletion is ever permitted
- Whether imports are partial upserts or full-corpus releases
- Whether staging approval is mandatory

### Daily Draw Semantics

Decisions are required on:

- Anonymous daily draws
- User timezone versus UTC
- Whether a draw is immutable for the day
- Whether historical draws store full meaning snapshots

### Billing

The billing provider, trial rules, grace periods, cancellation behavior, and
administrative entitlement overrides remain outside Phase 1.

### Data Delivery

The user experience should not require downloading all 3,003 complete meanings.
Pair lookup should be server-filtered, and administrative screens should use
pagination and search.

### AI Governance

Before AI implementation, define:

- Allowed user context
- Grounding and prompt format
- Storage and retention policy
- Rate limits and premium quotas
- Safety and privacy handling
- Labeling of authoritative and generated text
- Editorial review requirements for any generated content

## Phase 1 Completion Criteria

Phase 1 is complete when:

- Supabase schema and migrations are version controlled.
- The canonical deck and verified pair corpus are imported.
- Pair meanings are versioned and protected by grants and RLS.
- Secure pair read contracts exist for each access level.
- Supabase Auth and profiles replace mock authentication.
- Operational roles and premium entitlement are separate.
- Frontend data access goes through repositories and services.
- Pair reads no longer depend on localStorage or random fallback meanings.
- Database and authorization tests pass.

Billing, OpenAI integration, and new product functionality are explicitly not
required for Phase 1 completion.
