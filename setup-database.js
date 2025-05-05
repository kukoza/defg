const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// ข้อมูลการเชื่อมต่อ
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'db_username',
  password: process.env.DB_PASSWORD || '812Rw7f&u',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// สร้างฐานข้อมูลและตาราง
async function setupDatabase() {
  let connection;
  
  try {
    console.log('เริ่มการตั้งค่าฐานข้อมูล...');
    
    // เชื่อมต่อกับ MySQL (ยังไม่ระบุฐานข้อมูล)
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    const dbName = process.env.DB_NAME || 'carbookingsystem';
    
    // สร้างฐานข้อมูล (ถ้ายังไม่มี)
    console.log(`กำลังสร้างฐานข้อมูล ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // เลือกฐานข้อมูล
    await connection.query(`USE ${dbName}`);
    
    // สร้างตาราง users
    console.log('กำลังสร้างตาราง users...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        avatar VARCHAR(255),
        branch VARCHAR(255),
        company VARCHAR(255),
        tel VARCHAR(50),
        branch_address VARCHAR(255),
        branch_address_en VARCHAR(255)
      )
    `);
    
    // สร้างตาราง car_types
    console.log('กำลังสร้างตาราง car_types...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS car_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // สร้างตาราง cars
    console.log('กำลังสร้างตาราง cars...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        license_plate VARCHAR(20) NOT NULL,
        model VARCHAR(255) NOT NULL,
        type_id INT,
        status ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (type_id) REFERENCES car_types(id)
      )
    `);
    
    // สร้างตาราง bookings
    console.log('กำลังสร้างตาราง bookings...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        car_id INT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (car_id) REFERENCES cars(id)
      )
    `);
    
    // สร้างตาราง booking_history
    console.log('กำลังสร้างตาราง booking_history...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS booking_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        performed_by INT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (performed_by) REFERENCES users(id)
      )
    `);
    
    // สร้างตาราง settings
    console.log('กำลังสร้างตาราง settings...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // สร้างตาราง business_cards
    console.log('กำลังสร้างตาราง business_cards...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS business_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        position_th VARCHAR(255),
        position_en VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        line_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // เพิ่ม admin user (ถ้ายังไม่มี)
    console.log('กำลังตรวจสอบ admin user...');
    const [adminRows] = await connection.query('SELECT * FROM users WHERE email = ? AND role = ?', ['admin@example.com', 'admin']);
    
    if (adminRows.length === 0) {
      console.log('กำลังสร้าง admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@example.com', hashedPassword, 'Admin User', 'admin']
      );
    }
    
    console.log('การตั้งค่าฐานข้อมูลเสร็จสมบูรณ์!');
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();