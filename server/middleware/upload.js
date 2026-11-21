   const multer = require('multer');

   const fileFilter = (req, file, cb) => {
     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
     if (allowedTypes.includes(file.mimetype)) cb(null, true);
     else cb(new Error('Only JPG and PNG images are allowed (max 2MB)'), false);
   };

   module.exports = multer({
     storage: multer.memoryStorage(),
     limits: { fileSize: 2 * 1024 * 1024 },
     fileFilter,
   });