const fs = require('fs');
const path = require('path');

// ไดเร็กทอรีที่ต้องการสร้าง
const directories = [
  'public/uploads',
  'public/uploads/cars',
  'public/uploads/avatars',
  'public/uploads/business-cards'
];

// สร้างไดเร็กทอรี
function createDirectories() {
  console.log('เริ่มการสร้างไดเร็กทอรีสำหรับอัปโหลดไฟล์...');
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`สร้างไดเร็กทอรี ${fullPath} เรียบร้อยแล้ว`);
      } catch (error) {
        console.error(`เกิดข้อผิดพลาดในการสร้างไดเร็กทอรี ${fullPath}:`, error);
      }
    } else {
      console.log(`ไดเร็กทอรี ${fullPath} มีอยู่แล้ว`);
    }
  });
  
  console.log('การสร้างไดเร็กทอรีเสร็จสมบูรณ์!');
}

createDirectories();