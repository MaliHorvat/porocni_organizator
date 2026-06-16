-- Zaženi v phpMyAdmin na Neoserv (izberi svojo bazo)

CREATE TABLE IF NOT EXISTS weddings (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  partner1 VARCHAR(255) NOT NULL,
  partner2 VARCHAR(255) NOT NULL,
  wedding_date DATE NOT NULL,
  wedding_time VARCHAR(10) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  venue_address VARCHAR(500) NOT NULL,
  description TEXT,
  dress_code VARCHAR(255),
  rsvp_deadline DATE NOT NULL,
  gallery_enabled BOOLEAN DEFAULT FALSE,
  plan VARCHAR(20) NOT NULL,
  clerk_user_id VARCHAR(255),
  stripe_session_id VARCHAR(255) UNIQUE,
  payment_status VARCHAR(20),
  expected_guests INT NULL,
  max_guests_per_rsvp INT DEFAULT 8,
  menu_options JSON NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS rsvps (
  id VARCHAR(36) PRIMARY KEY,
  wedding_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  attending BOOLEAN NOT NULL,
  guest_count INT NOT NULL,
  menu_choice VARCHAR(50) NULL,
  guest_menus JSON NULL,
  allergies TEXT,
  message TEXT,
  created_at DATETIME NOT NULL,
  INDEX idx_rsvps_wedding (wedding_id)
);

CREATE TABLE IF NOT EXISTS photos (
  id VARCHAR(36) PRIMARY KEY,
  wedding_id VARCHAR(36) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  uploader_name VARCHAR(255) NOT NULL,
  caption TEXT,
  file_data LONGBLOB,
  created_at DATETIME NOT NULL,
  INDEX idx_photos_wedding (wedding_id)
);

-- Migracija obstoječe baze (poženi po vrsticah, ignoriraj če stolpec že obstaja):
-- ALTER TABLE weddings ADD COLUMN expected_guests INT NULL;
-- ALTER TABLE weddings ADD COLUMN max_guests_per_rsvp INT DEFAULT 8;
-- ALTER TABLE weddings ADD COLUMN menu_options JSON NULL;
-- ALTER TABLE rsvps ADD COLUMN guest_menus JSON NULL;
-- ALTER TABLE rsvps MODIFY COLUMN email VARCHAR(255) NULL;
-- ALTER TABLE rsvps MODIFY COLUMN menu_choice VARCHAR(50) NULL;
