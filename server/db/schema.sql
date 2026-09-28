-- ============================================================================
-- GPSWOX Fleet Enterprise - Complete PostgreSQL Schema & DDL
-- ============================================================================

-- 1. Clients & Users Table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(64),
    role VARCHAR(32) DEFAULT 'client',
    plan VARCHAR(64) DEFAULT 'Fleet Pro',
    max_devices INTEGER DEFAULT 25,
    expires_at DATE,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fleet Devices & Trackers Registry
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    imei VARCHAR(64) UNIQUE NOT NULL,
    plate_number VARCHAR(64),
    model VARCHAR(128),
    type VARCHAR(32) DEFAULT 'car',
    protocol VARCHAR(64) DEFAULT 'GT06',
    protocol_port INTEGER DEFAULT 5023,
    sim_number VARCHAR(64),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(64),
    client_id VARCHAR(64) REFERENCES clients(id) ON DELETE SET NULL,
    status VARCHAR(32) DEFAULT 'stopped',
    odometer NUMERIC(12, 2) DEFAULT 0.00,
    fuel_capacity NUMERIC(8, 2) DEFAULT 70.00,
    current_lat NUMERIC(10, 7),
    current_lng NUMERIC(10, 7),
    current_speed NUMERIC(6, 2) DEFAULT 0.00,
    current_heading INTEGER DEFAULT 0,
    current_ignition BOOLEAN DEFAULT FALSE,
    current_battery NUMERIC(5, 2) DEFAULT 12.60,
    current_gsm INTEGER DEFAULT 100,
    current_address TEXT,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Telemetry Positions Log (Time-Series Path History)
CREATE TABLE IF NOT EXISTS positions (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(64) REFERENCES devices(id) ON DELETE CASCADE,
    imei VARCHAR(64) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    altitude NUMERIC(8, 2) DEFAULT 0.00,
    speed NUMERIC(6, 2) DEFAULT 0.00,
    heading INTEGER DEFAULT 0,
    ignition BOOLEAN DEFAULT FALSE,
    battery_voltage NUMERIC(5, 2),
    gsm_signal INTEGER,
    address TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_packet TEXT
);

-- Create fast lookup indexes on positions
CREATE INDEX IF NOT EXISTS idx_positions_device_time ON positions(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_imei_time ON positions(imei, recorded_at DESC);

-- 4. Geofences & Polygon Zones
CREATE TABLE IF NOT EXISTS geofences (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) DEFAULT 'circle', -- 'circle' or 'polygon'
    color VARCHAR(32) DEFAULT '#00b4c6',
    fill_color VARCHAR(32) DEFAULT 'rgba(0, 180, 198, 0.2)',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    radius INTEGER DEFAULT 500,
    polygon_points JSONB, -- Array of [lat, lng] coordinates for custom freehand polygons
    active_vehicles INTEGER DEFAULT 0,
    speed_limit NUMERIC(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Alerts & Events History
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) REFERENCES devices(id) ON DELETE CASCADE,
    vehicle_name VARCHAR(255),
    type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) DEFAULT 'info',
    message TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fleet Expenses & Financial Ledger
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) REFERENCES devices(id) ON DELETE CASCADE,
    vehicle_name VARCHAR(255),
    type VARCHAR(64) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(16) DEFAULT 'SAR',
    quantity NUMERIC(10, 2) DEFAULT 0.00,
    unit VARCHAR(32) DEFAULT 'L',
    price_per_unit NUMERIC(10, 2),
    odometer NUMERIC(12, 2),
    date DATE NOT NULL,
    supplier VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reverse Geocoding Cache Table (Ensures instantaneous address lookup)
CREATE TABLE IF NOT EXISTS geocoding_cache (
    lat_round NUMERIC(7, 4) NOT NULL,
    lng_round NUMERIC(7, 4) NOT NULL,
    address TEXT NOT NULL,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lat_round, lng_round)
);
