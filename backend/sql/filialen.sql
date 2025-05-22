
-- Filialen Table
CREATE TABLE IF NOT EXISTS `filialen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert some sample data
INSERT INTO `filialen` (`name`, `address`) VALUES
('Zentrale Berlin', 'Hauptstraße 123, 10115 Berlin'),
('Filiale München', 'Maximilianstraße 45, 80539 München'),
('Filiale Hamburg', 'Reeperbahn 12, 20359 Hamburg');

-- Add filiale_id column to users table if it doesn't exist
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `filiale_id` int(11) NULL,
ADD CONSTRAINT `fk_users_filiale` FOREIGN KEY (`filiale_id`) REFERENCES `filialen` (`id`) ON DELETE SET NULL;

-- Add filiale_id to JWT token payload in auth functions
-- This would typically be handled in the authentication logic, where the filiale_id is added to the JWT payload
