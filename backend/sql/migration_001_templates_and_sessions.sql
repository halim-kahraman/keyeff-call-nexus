
-- Migration 001: Templates and Campaign Sessions
-- Execute this after the main database.sql

-- Templates table (if not exists)
CREATE TABLE IF NOT EXISTS `templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('email','whatsapp','sms') NOT NULL DEFAULT 'email',
  `category` enum('welcome','password_reset','2fa','campaign','appointment','general') NOT NULL DEFAULT 'general',
  `subject` varchar(500) DEFAULT NULL,
  `content` text NOT NULL,
  `placeholders` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campaign sessions table (if not exists)
CREATE TABLE IF NOT EXISTS `campaign_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_active_campaign` (`campaign_id`, `is_active`),
  KEY `idx_user` (`user_id`),
  KEY `idx_campaign` (`campaign_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_campaign_sessions_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_campaign_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Connection sessions table (if not exists)
CREATE TABLE IF NOT EXISTS `connection_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `filiale_id` int(11) NOT NULL,
  `connection_type` enum('vpn','sip','webrtc') NOT NULL,
  `status` enum('connecting','connected','disconnected','error') NOT NULL DEFAULT 'connecting',
  `started_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` timestamp NULL DEFAULT NULL,
  `last_ping` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `connection_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_filiale` (`filiale_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`connection_type`),
  CONSTRAINT `fk_connection_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_connection_sessions_filiale` FOREIGN KEY (`filiale_id`) REFERENCES `filialen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default templates if they don't exist
INSERT IGNORE INTO `templates` (`name`, `type`, `category`, `subject`, `content`, `placeholders`) VALUES
('Willkommen', 'email', 'welcome', 'Willkommen bei KeyEff - Ihr Zugang wurde aktiviert', 
'Hallo {{name}},\n\nwillkommen bei KeyEff! Ihr Zugang wurde erfolgreich aktiviert.\n\nIhre Anmeldedaten:\nBenutzername: {{email}}\nPasswort: {{password}}\n\nBitte loggen Sie sich unter {{login_url}} ein und ändern Sie Ihr Passwort.\n\nViele Grüße\nIhr KeyEff Team', 
'["{{name}}", "{{email}}", "{{password}}", "{{login_url}}"]'),

('Passwort zurücksetzen', 'email', 'password_reset', 'KeyEff - Passwort zurücksetzen', 
'Hallo {{name}},\n\nSie haben eine Passwort-Zurücksetzung angefordert.\n\nKlicken Sie auf den folgenden Link, um ein neues Passwort zu setzen:\n{{reset_url}}\n\nDieser Link ist 24 Stunden gültig.\n\nFalls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.\n\nViele Grüße\nIhr KeyEff Team', 
'["{{name}}", "{{reset_url}}"]'),

('2FA Code', 'email', '2fa', 'KeyEff - Ihr Sicherheitscode', 
'Hallo {{name}},\n\nIhr Sicherheitscode für die Zwei-Faktor-Authentifizierung:\n\n{{code}}\n\nDieser Code ist 10 Minuten gültig.\n\nViele Grüße\nIhr KeyEff Team', 
'["{{name}}", "{{code}}"]'),

('Kampagnen Skript Standard', 'campaign', 'campaign', '', 
'Guten Tag {{name}},\n\nmein Name ist {{agent_name}} von KeyEff.\n\nIch rufe Sie bezüglich Ihres Vertrags {{contract_type}} an.\n\nHaben Sie einen Moment Zeit für ein kurzes Gespräch?\n\n--- Gesprächsführung ---\n1. Aktuelle Situation erfragen\n2. Bedürfnisse ermitteln\n3. Lösung anbieten\n4. Termin vereinbaren', 
'["{{name}}", "{{agent_name}}", "{{contract_type}}"]');
