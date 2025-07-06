CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    item_category VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT NOT NULL,
    technical_specs TEXT NOT NULL,
    compliance_requirements TEXT NOT NULL,
    estimated_value DECIMAL(15,2) NULL,
    delivery_timeline VARCHAR(100) NULL,
    previous_experience TEXT NULL,
    certifications TEXT NULL,
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'draft',
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- only one timestamp with default
    updated_at DATETIME NULL,                        -- remove ON UPDATE
    submitted_at DATETIME NULL,
    INDEX idx_application_id (application_id),
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS application_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    upload_date DATETIME DEFAULT NULL,  -- change to DATETIME
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id)
);

CREATE TABLE IF NOT EXISTS application_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(20) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NULL,
    remarks TEXT NULL,
    created_at DATETIME DEFAULT NULL,  -- changed
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id)
);
