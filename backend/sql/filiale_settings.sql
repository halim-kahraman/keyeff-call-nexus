
-- Filiale Settings Table for branch-specific configurations
CREATE TABLE IF NOT EXISTS `filiale_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filiale_id` int(11) NOT NULL,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_filiale_setting` (`filiale_id`, `setting_key`),
  CONSTRAINT `fk_filiale_settings_filiale` FOREIGN KEY (`filiale_id`) REFERENCES `filialen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add common filiale-specific settings
INSERT INTO `filiale_settings` (`filiale_id`, `setting_key`, `setting_value`) VALUES
(1, 'phone_system_type', 'fritzbox'),
(1, 'fritzbox_ip', '192.168.1.1'),
(1, 'sip_enabled', '1'),
(2, 'phone_system_type', 'sip'),
(2, 'sip_server', 'sip.example.com'),
(2, 'sip_enabled', '1'),
(3, 'phone_system_type', 'fritzbox'),
(3, 'fritzbox_ip', '192.168.2.1'),
(3, 'sip_enabled', '0')
ON DUPLICATE KEY UPDATE 
`setting_value` = VALUES(`setting_value`),
`updated_at` = CURRENT_TIMESTAMP;
