import express from "express";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.js';
import diseaseRoutes from './routes/disease.js';
import chatRoutes from './routes/chat.js';
import historyRoutes from './routes/history.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global CORS for frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Serve model files with CORS headers
app.use('/models', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
}, express.static(path.join(__dirname, './models/ML_model/tfjs_model1')));

// Add CORS headers for auth routes
app.use('/auth', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
async function(accessToken, refreshToken, profile, done) {
    try {
        // Here you would typically:
        // 1. Check if user exists in your database
        // 2. If not, create new user
        // 3. Return user object
        return done(null, profile);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(rateLimiter);
// Routes
app.use('/auth', authRoutes);
app.use('/disease', diseaseRoutes);
app.use('/chat', chatRoutes);
app.use('/history', historyRoutes);

// Do NOT call loadModel() at startup; only load on demand in endpoints

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});



