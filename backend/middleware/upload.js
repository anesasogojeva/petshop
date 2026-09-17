const multer = require('multer');
const path = require('path');

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },               // 5 MB
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg', '.jpeg', '.png', '.webp'].includes(ext));
  }
});
