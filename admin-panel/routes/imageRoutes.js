// Image Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imageController = require('../controllers/imageController');
const { isAuthenticated } = require('../config/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/pending'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Public routes
// POST /api/images/upload
router.post('/upload', upload.single('image'), imageController.uploadImage);

// GET /api/images/approved
router.get('/approved', imageController.getApprovedImages);

// Admin routes (protected)
// GET /api/images/pending
router.get('/pending', isAuthenticated, imageController.getPendingImages);

// POST /api/images/:id/approve
router.post('/:id/approve', isAuthenticated, imageController.approveImage);

// POST /api/images/:id/reject
router.post('/:id/reject', isAuthenticated, imageController.rejectImage);

module.exports = router;
