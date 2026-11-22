import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${file.fieldname}-${Date.now()}-${cleanName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp)!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('image');

router.post('/', (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      res.statusCode = 400;
      return next(err);
    }

    if (!req.file) {
      res.statusCode = 400;
      return next(new Error('No image file selected from computer.'));
    }

    // Ensure path always uses forward slashes across all platforms
    const normalizedPath = `/${req.file.path.replace(/\\/g, '/')}`;

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: normalizedPath,
      imageUrl: normalizedPath,
      filename: req.file.filename
    });
  });
});

export default router;
