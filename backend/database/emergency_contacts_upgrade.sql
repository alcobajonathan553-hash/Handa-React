USE handa_db;

ALTER TABLE emergency_contacts
  ADD COLUMN IF NOT EXISTS relationship VARCHAR(80) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_primary TINYINT(1) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_primary
  ON emergency_contacts (user_id, is_primary);
