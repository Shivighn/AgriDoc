import express from 'express';
import { ChatGroq } from "@langchain/groq";
import { ConversationChain } from "langchain/chains";
import DiseaseReport from '../models/DiseaseReport.js';
import User from '../models/User.js';
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

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

// Fallback responses for when Groq is not available
const getFallbackResponse = (disease, message) => {
    const lowerMessage = message.toLowerCase();
    const lowerDisease = disease.toLowerCase();
    
    if (lowerMessage.includes('symptom')) {
        return `Common symptoms of ${disease} include leaf spots, wilting, yellowing, and stunted growth. The exact symptoms can vary depending on the plant species and disease severity.`;
    } else if (lowerMessage.includes('treat') || lowerMessage.includes('cure')) {
        return `To treat ${disease}, consider removing infected plant parts, improving air circulation, and using appropriate fungicides or pesticides. Always follow label instructions carefully.`;
    } else if (lowerMessage.includes('prevent')) {
        return `To prevent ${disease}, maintain good plant hygiene, avoid overhead watering, ensure proper spacing between plants, and use disease-resistant varieties when possible.`;
    } else if (lowerMessage.includes('cause')) {
        return `${disease} is typically caused by fungal, bacterial, or viral pathogens. Environmental factors like humidity, temperature, and poor air circulation can also contribute.`;
    } else {
        return `I can help you with ${disease}. This is a plant disease that affects various crops. Ask me about symptoms, treatment, prevention, or causes for more specific information.`;
    }
};

// Test endpoint to check configuration
router.get('/test', isAuthenticated, (req, res) => {
    res.json({
        success: true,
        message: 'Chat service is running'
    });
});

// Set up Groq LLM via LangChain
let llm;
if (process.env.GROQ_API_KEY) {
  llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "gemma2-9b-it",
    temperature: 0.7,
  });
  console.log("[Startup] Groq API key found. Using Groq gemma2-9b-it for chatbot.");
} else {
  llm = null;
  console.warn("[Startup] No Groq API key found. Only fallback responses will be used.");
}

const chain = llm ? new ConversationChain({ llm }) : null;

// Send message to AI
router.post('/message', isAuthenticated, async (req, res) => {
    console.log("[Chat] /message endpoint hit");
    try {
        const { disease, message, chatHistory } = req.body;

        if (!disease || !message) {
            console.warn("[Chat] Missing disease or message in request body.");
            return res.status(400).json({ error: 'Disease and message are required' });
        }

        if (!chain) {
            // No LLM available
            console.warn("[Chat] No Groq connection. Using fallback response.");
            const fallbackResponse = getFallbackResponse(disease, message);
            return res.json({
                success: true,
                response: fallbackResponse,
                isFallback: true,
                error: 'No Groq API key configured.'
            });
        }

        // Prepare system prompt
        const systemPrompt = `You are an agricultural expert specializing in plant diseases. The user's plant has been diagnosed with ${disease}. Provide helpful, accurate advice about treatment and prevention. Be concise but informative. Keep responses under 200 words.`;

        // Compose the input for LangChain
        let input = message;
        if (chatHistory && chatHistory.length > 0) {
            const recentHistory = chatHistory.slice(-6).map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n');
            input = `${systemPrompt}\n${recentHistory}\nUser: ${message}`;
        } else {
            input = `${systemPrompt}\nUser: ${message}`;
        }

        // Log LLM usage and input
        console.log("[Chat] Sending input to Groq LLM:", input);

        // Get response from LangChain
        const response = await chain.call({ input });

        // Log LLM response
        console.log("[Chat] Received response from Groq LLM:", response.response);

        res.json({
            success: true,
            response: response.response
        });
    } catch (error) {
        console.error('[Chat] Error in chat:', error);
        // Provide fallback response on error
        const { disease, message } = req.body;
        const fallbackResponse = getFallbackResponse(disease, message);
        res.json({
            success: true,
            response: fallbackResponse,
            isFallback: true,
            error: 'LLM service temporarily unavailable'
        });
    }
});

export default router; 