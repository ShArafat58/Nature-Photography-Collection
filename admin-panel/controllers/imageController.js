// Image Controller
const { queries } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Get all pending images
exports.getPendingImages = (req, res) => {
    try {
        const images = queries.getPendingImages.all();
        res.json({ success: true, images });
    } catch (error) {
        console.error('Error fetching pending images:', error);
        res.status(500).json({ error: 'Failed to fetch pending images' });
    }
};

// Get all approved images (for public gallery)
exports.getApprovedImages = (req, res) => {
    try {
        const images = queries.getApprovedImages.all();
        res.json({ success: true, images });
    } catch (error) {
        console.error('Error fetching approved images:', error);
        res.status(500).json({ error: 'Failed to fetch approved images' });
    }
};

// Approve an image
exports.approveImage = (req, res) => {
    try {
        const { id } = req.params;
        const image = queries.getImageById.get(id);

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        if (image.status !== 'pending') {
            return res.status(400).json({ error: 'Image is not pending' });
        }

        // Move file from pending to approved
        const pendingPath = path.join(__dirname, '../../uploads/pending', image.filename);
        const approvedPath = path.join(__dirname, '../../uploads/approved', image.filename);

        if (fs.existsSync(pendingPath)) {
            fs.renameSync(pendingPath, approvedPath);
        }

        // Update database
        queries.approveImage.run(id);

        res.json({ success: true, message: 'Image approved successfully' });
    } catch (error) {
        console.error('Error approving image:', error);
        res.status(500).json({ error: 'Failed to approve image' });
    }
};

// Reject an image
exports.rejectImage = (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const image = queries.getImageById.get(id);

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        if (image.status !== 'pending') {
            return res.status(400).json({ error: 'Image is not pending' });
        }

        // Delete file from pending folder
        const pendingPath = path.join(__dirname, '../../uploads/pending', image.filename);
        if (fs.existsSync(pendingPath)) {
            fs.unlinkSync(pendingPath);
        }

        // Update database
        queries.rejectImage.run(reason || 'No reason provided', id);

        res.json({ success: true, message: 'Image rejected successfully' });
    } catch (error) {
        console.error('Error rejecting image:', error);
        res.status(500).json({ error: 'Failed to reject image' });
    }
};

// Upload new image (public endpoint)
exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { photographer_name, phone_model } = req.body;

        if (!photographer_name || !phone_model) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Photographer name and phone model are required' });
        }

        // Insert into database
        const result = queries.insertImage.run(
            req.file.filename,
            req.file.originalname,
            photographer_name,
            phone_model
        );

        res.json({
            success: true,
            message: 'Image submitted for review',
            imageId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        // Clean up file if database insert fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to upload image' });
    }
};
