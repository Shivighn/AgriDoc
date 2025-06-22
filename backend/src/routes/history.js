import express from 'express';
import DiseaseReport from '../models/DiseaseReport.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    if (req.isAuthenticated()) {
        try {
            // Find or create user in database
            let user = await User.findOne({ googleId: req.user.id });
            
            if (!user) {
                // Create new user if doesn't exist
                user = await User.create({
                    googleId: req.user.id,
                    email: req.user.emails[0].value,
                    name: req.user.displayName,
                    profilePicture: req.user.photos[0].value
                });
            }
            
            // Attach the database user to the request
            req.dbUser = user;
            return next();
        } catch (error) {
            console.error('Error finding/creating user:', error);
            return res.status(500).json({ error: 'Authentication error' });
        }
    }
    res.status(401).json({ error: 'Please log in to continue' });
};

// Get all reports for the current user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const reports = await DiseaseReport.find({ userId: req.dbUser._id })
                        .sort({ createdAt: -1 });

        res.json({
            success: true,
            reports
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Error fetching reports' });
    }
});

// Save chat history to a report
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { reportId, chatHistory } = req.body;
        
        if (!reportId) {
            return res.status(400).json({ error: 'Report ID is required' });
        }

        const report = await DiseaseReport.findById(reportId);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.userId.toString() !== req.dbUser._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update the report with new chat history
        report.chatHistory = chatHistory || report.chatHistory;
        await report.save();

        res.json({
            success: true,
            message: 'Chat history saved successfully',
            report
        });
    } catch (error) {
        console.error('Error saving chat history:', error);
        res.status(500).json({ error: 'Error saving chat history' });
    }
});

// Get specific report with chat history
router.get('/:reportId', isAuthenticated, async (req, res) => {
    try {
        const report = await DiseaseReport.findById(req.params.reportId);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.userId.toString() !== req.dbUser._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Error fetching report' });
    }
});

// Delete a report by ID
router.delete('/:reportId', isAuthenticated, async (req, res) => {
  try {
    const report = await DiseaseReport.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only allow the owner to delete
    if (report.userId.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await report.deleteOne();
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Error deleting report' });
  }
});

export default router; 