import express from 'express';
import DiseaseReport from '../models/DiseaseReport.js';
import User from '../models/User.js';
import { getPrediction, preprocessImage } from '../utils/modelPredictor.js';
import * as tf from '@tensorflow/tfjs';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
        try {
            // Find or create user in database
            let user = await User.findOne({ googleId: req.user.id });
            if (!user) {
                user = await User.create({
                    googleId: req.user.id,
                    email: req.user.emails[0].value,
                    name: req.user.displayName,
                    profilePicture: req.user.photos[0].value
                });
            }
            req.dbUser = user;
            return next();
        } catch (error) {
            console.error('Error finding/creating user:', error);
            return res.status(500).json({ error: 'Authentication error' });
        }
    }
    res.status(401).json({ error: 'Please log in to continue' });
};

// Multer setup for image upload
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
            cb(null, true);
        } else {
            cb(new Error('Only .jpg, .jpeg, .png files are allowed'));
        }
    }
});

// Analyze preprocessed tensor (sent as JSON array)
router.post('/analyze', isAuthenticated, async (req, res) => {
    try {
        const { tensor } = req.body;
        if (!tensor || !Array.isArray(tensor)) {
            return res.status(400).json({ error: 'No preprocessed tensor provided. Please send a 4D tensor as a flat array.' });
        }
        // Convert flat array to tf.Tensor4D [1,128,128,3]
        const inputTensor = tf.tensor4d(tensor, [1, 128, 128, 3], 'float32');
        console.log('Received tensor shape:', inputTensor.shape, 'dtype:', inputTensor.dtype);
        const prediction = await getPrediction(inputTensor);
        inputTensor.dispose();
        // Create initial disease report (without storing the image)
        const diseaseReport = await DiseaseReport.create({
            userId: req.dbUser._id,
            predictedDisease: prediction.disease,
            confidence: prediction.confidence,
            chatHistory: [{
                role: 'assistant',
                content: `I've detected ${prediction.disease} in your plant with ${(prediction.confidence * 100).toFixed(2)}% confidence. How can I help you with this?`
            }]
        });
        res.json({
            success: true,
            report: diseaseReport
        });
    } catch (error) {
        console.error('Error in image analysis:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

// New endpoint: Analyze uploaded image
router.post('/analyze-image', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }
        // Preprocess image buffer
        const inputTensor = await preprocessImage(req.file.buffer);
        const prediction = await getPrediction(inputTensor);
        inputTensor.dispose();
        // Create initial disease report (without storing the image)
        const diseaseReport = await DiseaseReport.create({
            userId: req.dbUser._id,
            predictedDisease: prediction.disease,
            confidence: prediction.confidence,
            chatHistory: [{
                role: 'assistant',
                content: `I've detected ${prediction.disease} in your plant with ${(prediction.confidence * 100).toFixed(2)}% confidence. How can I help you with this?`
            }]
        });
        res.json({
            success: true,
            report: diseaseReport
        });
    } catch (error) {
        console.error('Error in image analysis:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

// Save disease report
router.post('/save', isAuthenticated, async (req, res) => {
    try {
        const { reportId } = req.body;
        const report = await DiseaseReport.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        if (report.userId.toString() !== req.dbUser._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        res.json({
            success: true,
            message: 'Report saved successfully'
        });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Error saving report' });
    }
});

export default router; 