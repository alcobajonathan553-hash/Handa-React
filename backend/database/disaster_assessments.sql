USE handa_db;

CREATE TABLE IF NOT EXISTS disaster_assessments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  disaster_key VARCHAR(30) NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  answers JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_disaster_assessments_user_date (user_id, created_at),
  KEY idx_disaster_assessments_user_disaster (user_id, disaster_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
