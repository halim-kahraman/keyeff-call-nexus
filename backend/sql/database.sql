
-- KeyEff Call Panel Database Structure

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'telefonist', 'filialleiter') NOT NULL DEFAULT 'telefonist',
    filiale VARCHAR(100) NULL,
    avatar VARCHAR(255) NULL,
    otp VARCHAR(6) NULL,
    otp_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NULL,
    phone VARCHAR(20) NOT NULL,
    contract_type VARCHAR(50) NULL,
    contract_status ENUM('Aktiv', 'Inaktiv', 'Gekündigt', 'In Bearbeitung') DEFAULT 'Aktiv',
    contract_expiry DATE NULL,
    last_contact DATETIME NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Call Logs Table
CREATE TABLE call_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    user_id INT NOT NULL,
    log_text TEXT NOT NULL,
    outcome VARCHAR(50) NOT NULL,
    duration INT DEFAULT 0, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Appointments Table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    status ENUM('scheduled', 'completed', 'canceled', 'rescheduled') DEFAULT 'scheduled',
    synced_to_crm BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Settings Table
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    `key` VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    filiale_id INT NULL, -- NULL means global setting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (category, `key`, filiale_id)
);

-- Logs Table (DSGVO, Activity)
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL for system actions
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample Data - Default Admin User
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@keyeff.de', '$2y$10$mr5ZU8HeRZvzAQS9qXGK8.lq3aW1zgKrIdQ4OlEESgK6SVHtq0zJa', 'admin');
-- Password is 'password' hashed with password_hash()

-- Sample Data - Other Users
INSERT INTO users (name, email, password, role, filiale) 
VALUES ('Max Müller', 'telefonist@keyeff.de', '$2y$10$mr5ZU8HeRZvzAQS9qXGK8.lq3aW1zgKrIdQ4OlEESgK6SVHtq0zJa', 'telefonist', 'Berlin');

INSERT INTO users (name, email, password, role, filiale) 
VALUES ('Sarah Schmidt', 'filialleiter@keyeff.de', '$2y$10$mr5ZU8HeRZvzAQS9qXGK8.lq3aW1zgKrIdQ4OlEESgK6SVHtq0zJa', 'filialleiter', 'München');

-- Sample Data - Customers
INSERT INTO customers (name, company, phone, contract_type, contract_status, contract_expiry, last_contact, priority, notes)
VALUES 
('Albert Schmidt', 'Schmidt Elektro GmbH', '+49 30 12345678', 'Premium Service', 'Aktiv', '2025-06-15', '2025-04-01', 'high', 'Langjähriger Kunde, interessiert an Vertragsverlängerung'),
('Maria Müller', 'Müller Marketing', '+49 30 87654321', 'Basic Service', 'Aktiv', '2025-06-01', '2025-04-10', 'medium', 'Potenzial für Upgrade auf Premium'),
('Thomas Weber', 'Weber & Söhne', '+49 30 55443322', 'Premium Plus', 'Inaktiv', '2025-03-01', '2025-03-15', 'low', 'Vertrag abgelaufen');

-- Sample Data - Default Settings
INSERT INTO settings (category, `key`, value) VALUES 
('smtp', 'server', 'smtp.keyeff.de'),
('smtp', 'port', '587'),
('smtp', 'username', 'system@keyeff.de'),
('smtp', 'password', 'password'),
('smtp', 'sender_name', 'KeyEff System'),
('smtp', 'sender_email', 'system@keyeff.de'),

('api', 'endpoint', 'https://api.keyeff.de/v1'),
('api', 'token', 'sample_api_token'),
('api', 'sync_interval', '15');

-- Filiale-specific settings for Berlin
INSERT INTO settings (category, `key`, value, filiale_id) VALUES 
('sip', 'server', 'sip.keyeff.de', 1),
('sip', 'port', '5060', 1),
('sip', 'username', 'berlin', 1),
('sip', 'password', 'password', 1),
('sip', 'enable_webrtc', 'true', 1),

('fritzbox', 'enable', 'true', 1),
('fritzbox', 'ip', '192.168.178.1', 1),
('fritzbox', 'username', 'admin', 1),
('fritzbox', 'password', 'password', 1),
('fritzbox', 'use_fallback', 'true', 1);

-- Filiale-specific settings for München
INSERT INTO settings (category, `key`, value, filiale_id) VALUES 
('sip', 'server', 'sip.keyeff.de', 2),
('sip', 'port', '5060', 2),
('sip', 'username', 'muenchen', 2),
('sip', 'password', 'password', 2),
('sip', 'enable_webrtc', 'true', 2),

('fritzbox', 'enable', 'false', 2),
('fritzbox', 'ip', '', 2),
('fritzbox', 'username', '', 2),
('fritzbox', 'password', '', 2),
('fritzbox', 'use_fallback', 'false', 2);
