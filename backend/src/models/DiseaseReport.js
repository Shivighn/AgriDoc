import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const diseaseReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    predictedDisease: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    chatHistory: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DiseaseReport = mongoose.model('DiseaseReport', diseaseReportSchema);



export default DiseaseReport; 