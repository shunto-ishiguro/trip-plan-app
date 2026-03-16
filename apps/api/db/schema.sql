-- Enums
CREATE TYPE budget_category AS ENUM ('transport', 'accommodation', 'food', 'activity', 'other');
CREATE TYPE pricing_type AS ENUM ('total', 'per_person');
CREATE TYPE checklist_type AS ENUM ('packing', 'todo');
CREATE TYPE reservation_type AS ENUM ('flight', 'hotel', 'rental_car', 'restaurant', 'activity', 'other');
CREATE TYPE share_permission AS ENUM ('view', 'edit');
CREATE TYPE trip_role AS ENUM ('owner', 'editor', 'viewer');

-- Tables
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 1,
    memo TEXT,
    owner_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_index INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    address TEXT,
    start_time TEXT,
    end_time TEXT,
    memo TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    category budget_category NOT NULL DEFAULT 'other',
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    pricing_type pricing_type NOT NULL DEFAULT 'total',
    memo TEXT
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    type checklist_type NOT NULL DEFAULT 'packing',
    text TEXT NOT NULL,
    checked BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    type reservation_type NOT NULL DEFAULT 'other',
    name TEXT NOT NULL,
    confirmation_number TEXT,
    datetime TEXT,
    link TEXT,
    memo TEXT
);

CREATE TABLE share_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    share_url TEXT,
    permission share_permission NOT NULL DEFAULT 'view',
    share_token TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL
);

CREATE TABLE trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role trip_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(trip_id, user_id)
);
