import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// Google OAuth login route
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            // Check if user exists in database
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
            
            // Redirect to frontend with user data
            res.redirect('http://localhost:5173/diagnose');
        } catch (error) {
            console.error('Error in Google callback:', error);
            res.redirect('http://localhost:5173/?error=true');
        }
    }
);

// Auth status route
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            id: req.user.id,
            email: req.user.emails[0].value,
            name: req.user.displayName,
            profilePicture: req.user.photos[0].value
        });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

// Get current user route
router.get('/current-user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user: req.user
        });
    } else {
        res.json({
            isAuthenticated: false,
            user: null
        });
    }
});

export default router; 