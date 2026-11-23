USE handa_db;

-- Add a source marker so LGU-released items can be separated from starter/personal kit items.
ALTER TABLE user_supplies
  ADD COLUMN IF NOT EXISTS source ENUM('personal', 'lgu') NOT NULL DEFAULT 'personal';

-- Existing rows remain personal by default. New LGU releases are marked as lgu.
