create extension if not exists pgcrypto;

create table users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    wallet_address text unique,
    display_name text not null,
    avatar_url text,
    role text not null default 'tourist' check (role in ('tourist', 'guide', 'admin')),
    xp integer not null default 0,
    rank text not null default 'novice',
    total_completions integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table guides (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    license_number text,
    license_document_url text,
    bio text,
    languages text[] default '{}',
    specialties text[] default '{}',
    years_experience integer default 0,
    is_verified boolean not null default false,
    verified_at timestamptz,
    verified_by uuid references users(id),
    is_suspended boolean not null default false,
    reputation_pda text,
    on_chain_score numeric(5,2),
    on_chain_reviews integer default 0,
    created_at timestamptz not null default now()
);

create table places (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    category text not null check (category in ('trailhead', 'checkpoint', 'summit', 'teahouse', 'viewpoint', 'temple', 'village', 'activity_center')),
    latitude numeric(10,7) not null,
    longitude numeric(10,7) not null,
    altitude_meters integer,
    region text not null,
    qr_code_hash text,
    image_url text,
    is_active boolean not null default true,
    created_by uuid references users(id),
    created_at timestamptz not null default now()
);

create table routes (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    difficulty text not null check (difficulty in ('easy', 'moderate', 'challenging', 'extreme')),
    duration_days integer not null,
    distance_km numeric(6,1),
    max_altitude_meters integer,
    region text not null,
    image_url text,
    is_active boolean not null default true,
    created_by uuid references users(id),
    created_at timestamptz not null default now()
);

create table route_checkpoints (
    id uuid primary key default gen_random_uuid(),
    route_id uuid not null references routes(id) on delete cascade,
    place_id uuid not null references places(id) on delete cascade,
    sequence_order integer not null,
    is_required boolean not null default true,
    unique(route_id, sequence_order)
);

create table quests (
    id uuid primary key default gen_random_uuid(),
    route_id uuid references routes(id) on delete cascade,
    place_id uuid references places(id) on delete cascade,
    title text not null,
    description text not null,
    story_text text,
    quest_type text not null check (quest_type in ('visit', 'photo', 'learn', 'interact', 'collect')),
    xp_reward integer not null default 10,
    difficulty text not null default 'easy',
    is_active boolean not null default true,
    created_by uuid references users(id),
    created_at timestamptz not null default now()
);

create table services (
    id uuid primary key default gen_random_uuid(),
    guide_id uuid not null references guides(id) on delete cascade,
    route_id uuid references routes(id) on delete cascade,
    title text not null,
    description text,
    price_usd numeric(10,2) not null,
    max_group_size integer not null default 8,
    includes text[] default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table bookings (
    id uuid primary key default gen_random_uuid(),
    tourist_id uuid not null references users(id) on delete cascade,
    guide_id uuid not null references guides(id) on delete cascade,
    service_id uuid not null references services(id) on delete cascade,
    route_id uuid references routes(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'active', 'completed', 'disputed', 'refunded', 'cancelled')),
    start_date date not null,
    end_date date,
    total_price_usd numeric(10,2) not null,
    escrow_pda text,
    escrow_tx_signature text,
    milestones_total integer not null default 1,
    milestones_completed integer not null default 0,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table check_ins (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references bookings(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    place_id uuid not null references places(id) on delete cascade,
    quest_id uuid references quests(id) on delete set null,
    method text not null check (method in ('gps', 'qr', 'guide_confirm', 'gps_qr')),
    latitude numeric(10,7),
    longitude numeric(10,7),
    guide_signature text,
    photo_url text,
    verified boolean not null default false,
    created_at timestamptz not null default now()
);

create table reviews (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references bookings(id) on delete cascade,
    reviewer_id uuid not null references users(id) on delete cascade,
    guide_id uuid not null references guides(id) on delete cascade,
    rating integer not null check (rating between 1 and 5),
    comment text,
    is_flagged boolean not null default false,
    on_chain_updated boolean not null default false,
    created_at timestamptz not null default now(),
    unique(booking_id, reviewer_id)
);

create table disputes (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references bookings(id) on delete cascade,
    filed_by uuid not null references users(id) on delete cascade,
    category text not null check (category in ('no_show', 'safety', 'billing', 'quality', 'other')),
    description text not null,
    evidence_urls text[] default '{}',
    status text not null default 'open' check (status in ('open', 'under_review', 'resolved_refund', 'resolved_partial', 'resolved_dismissed')),
    resolved_by uuid references users(id) on delete set null,
    resolution_notes text,
    created_at timestamptz not null default now(),
    resolved_at timestamptz
);

create table completion_proofs (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references bookings(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    route_id uuid references routes(id) on delete set null,
    nft_mint_address text,
    mint_tx_signature text,
    metadata_uri text,
    created_at timestamptz not null default now()
);
