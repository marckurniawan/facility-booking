CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_role
        CHECK (role IN ('user', 'admin'))
);

CREATE UNIQUE INDEX users_username_lower_unique
    ON users (LOWER(username));

CREATE UNIQUE INDEX users_email_lower_unique
    ON users (LOWER(email));

CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_capacity
        CHECK (capacity > 0),

    CONSTRAINT facilities_status_check
        CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    CONSTRAINT bookings_facility_id_fkey
        FOREIGN KEY (facility_id)
        REFERENCES facilities(id)
        ON DELETE RESTRICT,

    CONSTRAINT bookings_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT bookings_check
        CHECK (start_time < end_time),

    CONSTRAINT bookings_status_check
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'cancelled'
            )
        ),

    CONSTRAINT check_overlapping_bookings
        EXCLUDE USING gist (
            facility_id WITH =,
            tstzrange(start_time, end_time, '[)') WITH &&
        )
        WHERE (status NOT IN ('rejected', 'cancelled'))
);
