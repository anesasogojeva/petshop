
const multer  = require('multer');
const path    = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',                             // or leave blank for memory storage
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },               // 5 MB
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg', '.jpeg', '.png', '.webp'].includes(ext));
  }
});