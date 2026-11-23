USE handa_db;

CREATE TABLE IF NOT EXISTS supply_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  supply_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Released') NOT NULL DEFAULT 'Pending',
  admin_note VARCHAR(500) NULL,
  reviewed_by VARCHAR(128) NULL,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  released_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_supply_requests_user_created (user_id, created_at),
  KEY idx_supply_requests_supply_status (supply_id, status),
  CONSTRAINT fk_supply_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_supply_requests_supply FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
