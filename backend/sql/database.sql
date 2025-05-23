
-- KeyEff Call Panel Database Structure

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'telefonist', 'filialleiter') NOT NULL DEFAULT 'telefonist',
    filiale VARCHAR(100) NULL,
    filiale_id INT NULL,
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
    email VARCHAR(100) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    notes TEXT NULL,
    filiale_id INT NULL, -- The branch this customer belongs to
    campaign_id INT NULL, -- Optional campaign association
    imported_by INT NULL, -- User ID who imported this customer
    import_source ENUM('manual', 'excel', 'csv', 'api') DEFAULT 'manual',
    last_contact DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Customer Contracts Table (NEW)
CREATE TABLE customer_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    contract_number VARCHAR(50) NULL,
    contract_type VARCHAR(50) NOT NULL,
    contract_status ENUM('Aktiv', 'Inaktiv', 'Gekündigt', 'In Bearbeitung') DEFAULT 'Aktiv',
    contract_start DATE NULL,
    contract_expiry DATE NULL,
    monthly_value DECIMAL(10,2) NULL,
    primary_contact BOOLEAN DEFAULT FALSE, -- Is this the primary contact for this customer
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Customer Contact Numbers (NEW)
CREATE TABLE customer_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    contract_id INT NULL, -- Optional association with a specific contract
    phone VARCHAR(20) NOT NULL,
    contact_type ENUM('Hauptnummer', 'Mobil', 'Vertragsnummer', 'Alternativ', 'Sonstige') DEFAULT 'Hauptnummer',
    contact_name VARCHAR(100) NULL, -- Name of the contact person
    is_primary BOOLEAN DEFAULT FALSE, -- Is this the primary contact number
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES customer_contracts(id) ON DELETE SET NULL
);

-- Campaigns Table (NEW)
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    filiale_id INT NULL, -- NULL means global campaign
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('Active', 'Pending', 'Completed', 'Cancelled') DEFAULT 'Active',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Campaign to Customer mapping (NEW)
CREATE TABLE campaign_customers (
    campaign_id INT NOT NULL,
    customer_id INT NOT NULL,
    status ENUM('Pending', 'Called', 'Not Interested', 'Callback', 'Completed') DEFAULT 'Pending',
    assigned_to INT NULL, -- User assigned to call this customer
    PRIMARY KEY (campaign_id, customer_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Customer Import Logs (NEW)
CREATE TABLE import_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    import_type ENUM('excel', 'csv', 'api') NOT NULL,
    file_name VARCHAR(255) NULL,
    campaign_id INT NULL,
    total_records INT DEFAULT 0,
    successful_records INT DEFAULT 0,
    failed_records INT DEFAULT 0,
    error_details TEXT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Call Logs Table
CREATE TABLE call_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    user_id INT NOT NULL,
    contract_id INT NULL, -- NEW: Which contract was discussed
    contact_id INT NULL, -- NEW: Which contact number was called
    campaign_id INT NULL, -- NEW: Which campaign this call is part of
    log_text TEXT NOT NULL,
    outcome VARCHAR(50) NOT NULL,
    duration INT DEFAULT 0, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contract_id) REFERENCES customer_contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (contact_id) REFERENCES customer_contacts(id) ON DELETE SET NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

-- Appointments Table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    user_id INT NOT NULL,
    contract_id INT NULL, -- NEW: Which contract is related to this appointment
    title VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    status ENUM('scheduled', 'completed', 'canceled', 'rescheduled') DEFAULT 'scheduled',
    synced_to_crm BOOLEAN DEFAULT FALSE,
    campaign_id INT NULL, -- NEW: Which campaign this appointment is part of
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contract_id) REFERENCES customer_contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
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

-- Filialen table (Branch offices)
CREATE TABLE IF NOT EXISTS filialen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    manager_id INT NULL, -- Filialleiter
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
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

-- Sample Customers
INSERT INTO customers (name, company, email, notes, priority) VALUES 
('Albert Schmidt', 'Schmidt Elektro GmbH', 'info@schmidt-elektro.de', 'Langjähriger Kunde, interessiert an Vertragsverlängerung', 'high'),
('Maria Müller', 'Müller Marketing', 'kontakt@mueller-marketing.de', 'Potenzial für Upgrade auf Premium', 'medium'),
('Thomas Weber', 'Weber & Söhne', 'info@weber-soehne.de', 'Vertrag abgelaufen', 'low');

-- Sample Customer Contracts
INSERT INTO customer_contracts (customer_id, contract_number, contract_type, contract_status, contract_start, contract_expiry, monthly_value, primary_contact)
VALUES 
(1, 'KE-2023-001', 'Premium Service', 'Aktiv', '2023-01-01', '2025-06-15', 129.99, 1),
(2, 'KE-2023-002', 'Basic Service', 'Aktiv', '2023-02-15', '2025-06-01', 49.99, 1),
(3, 'KE-2023-003', 'Premium Plus', 'Inaktiv', '2022-05-10', '2023-03-01', 199.99, 1);

-- Sample Customer Contact Numbers
INSERT INTO customer_contacts (customer_id, contract_id, phone, contact_type, contact_name, is_primary)
VALUES 
(1, 1, '+49 30 12345678', 'Hauptnummer', 'Albert Schmidt', 1),
(1, 1, '+49 151 98765432', 'Mobil', 'Albert Schmidt', 0),
(2, 2, '+49 30 87654321', 'Hauptnummer', 'Maria Müller', 1),
(3, 3, '+49 30 55443322', 'Hauptnummer', 'Thomas Weber', 1),
(3, 3, '+49 30 55443323', 'Vertragsnummer', 'Büro Weber & Söhne', 0);

-- Sample Campaign
INSERT INTO campaigns (name, description, status, created_by)
VALUES ('Frühjahr 2023', 'Vertragsverlängerungen für Q2 2023', 'Active', 1);

-- Link customers to campaign
INSERT INTO campaign_customers (campaign_id, customer_id, status)
VALUES 
(1, 1, 'Pending'),
(1, 2, 'Pending'),
(1, 3, 'Pending');

-- Logs for calls
INSERT INTO call_logs (customer_id, user_id, contract_id, contact_id, log_text, outcome, duration)
VALUES 
(1, 1, 1, 1, 'Kunde interessiert an Vertragsverlängerung', 'interested', 485),
(2, 2, 2, 3, 'Kunde wünscht Rückruf in einer Woche', 'callback', 320),
(3, 2, 3, 4, 'Kunde nicht erreicht', 'no_answer', 60);

-- Default Settings
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

-- Filiale-specific settings
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

-- Sample Filialen data
INSERT INTO filialen (name, address, city, postal_code, phone, email, status) VALUES
('Berlin', 'Alexanderplatz 1', 'Berlin', '10178', '+49 30 1234567', 'berlin@keyeff.de', 'active'),
('München', 'Marienplatz 1', 'München', '80331', '+49 89 1234567', 'muenchen@keyeff.de', 'active'),
('Hamburg', 'Jungfernstieg 1', 'Hamburg', '20354', '+49 40 1234567', 'hamburg@keyeff.de', 'active');
