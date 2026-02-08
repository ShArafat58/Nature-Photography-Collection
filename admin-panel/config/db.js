// Database Configuration and Setup
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
    // Create images table
    db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      photographer_name TEXT NOT NULL,
      phone_model TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      review_date DATETIME,
      rejection_reason TEXT
    )
  `);

    // Create admin users table
    db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Check if admin user exists, if not create default admin
    const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();

    if (adminExists.count === 0) {
        const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
        const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const passwordHash = bcrypt.hashSync(defaultPassword, 10);

        db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)')
            .run(defaultUsername, passwordHash);

        console.log('✅ Default admin user created');
        console.log(`   Username: ${defaultUsername}`);
        console.log(`   Password: ${defaultPassword}`);
        console.log('   ⚠️  Please change the password in production!');
    }

    console.log('✅ Database initialized successfully');
}

// Database query functions
const queries = {
    // Image queries
    insertImage: db.prepare(`
    INSERT INTO images (filename, original_name, photographer_name, phone_model)
    VALUES (?, ?, ?, ?)
  `),

    getPendingImages: db.prepare(`
    SELECT * FROM images WHERE status = 'pending' ORDER BY upload_date DESC
  `),

    getApprovedImages: db.prepare(`
    SELECT * FROM images WHERE status = 'approved' ORDER BY review_date DESC
  `),

    getImageById: db.prepare('SELECT * FROM images WHERE id = ?'),

    approveImage: db.prepare(`
    UPDATE images 
    SET status = 'approved', review_date = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),

    rejectImage: db.prepare(`
    UPDATE images 
    SET status = 'rejected', review_date = CURRENT_TIMESTAMP, rejection_reason = ? 
    WHERE id = ?
  `),

    getStatistics: db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM images
  `),

    // Admin queries
    getAdminByUsername: db.prepare('SELECT * FROM admin_users WHERE username = ?'),
};

module.exports = {
    db,
    queries,
    initializeDatabase
};
