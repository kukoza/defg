const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function resetAdminPassword() {
  let connection;
  
  try {
    console.log('เริ่มการรีเซ็ตรหัสผ่าน admin...');
    
    // เชื่อมต่อกับฐานข้อมูล
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'db_username',
      password: process.env.DB_PASSWORD || '812Rw7f&u',
      database: process.env.DB_NAME || 'carbookingsystem'
    });
    
    // รีเซ็ตรหัสผ่าน admin เป็น 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'UPDATE users SET password = ? WHERE email = ? AND role = ?',
      [hashedPassword, 'admin@example.com', 'admin']
    );
    
    console.log('รีเซ็ตรหัสผ่าน admin เรียบร้อยแล้ว!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetAdminPassword();