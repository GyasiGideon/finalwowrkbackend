CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);




CREATE TABLE dispensers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  dispenser_uid TEXT UNIQUE NOT NULL,
  sanitizer_level INTEGER DEFAULT 100,
  tissue_level INTEGER DEFAULT 100,
  tamper_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dispenser_id UUID REFERENCES dispensers(id) ON DELETE CASCADE,
  sanitizer_level INTEGER NOT NULL,
  tissue_level INTEGER NOT NULL,
  fault TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE reports
  ALTER COLUMN sanitizer_level TYPE NUMERIC(5,2),
  ALTER COLUMN tissue_level TYPE NUMERIC(5,2);
ALTER TABLE reports
  ADD COLUMN system_status TEXT NOT NULL DEFAULT 'OFF',
  ADD COLUMN connection_status TEXT NOT NULL DEFAULT 'OFFLINE';
