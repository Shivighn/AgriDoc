import * as tf from '@tensorflow/tfjs';
import fetch from 'node-fetch';
import fs from 'fs';
import jpeg from 'jpeg-js';

// Complete class names for the 38 plant diseases (as per test notebook)
const CLASS_NAMES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
];

let model = null;
const MODEL_URL = 'http://localhost:5000/models/model.json'; // Now serves ML_model/tfjs_model1 (GraphModel)

// Load the model from HTTP URL (served by backend static)
export const loadModel = async () => {
    try {
        if (!model) {
            // Load as GraphModel (original model format)
            console.log('🔄 Loading model from:', MODEL_URL);
            model = await tf.loadGraphModel(MODEL_URL);
            console.log('✅ TensorFlow.js GraphModel loaded from', MODEL_URL);
            
            // Check model input/output shapes
            console.log('🔍 Model input shapes:', model.inputs.map(input => input.shape));
            console.log('🔍 Model output shapes:', model.outputs.map(output => output.shape));
            
            // Test model with dummy input to verify it works
            const dummyInput = tf.zeros([1, 128, 128, 3]);
            const testOutput = await model.execute(dummyInput);
            console.log('🔍 Test prediction shape:', testOutput.shape);
            console.log('🔍 Test prediction length:', (await testOutput.data()).length);
        }
    } catch (error) {
        console.error('❌ Error loading TensorFlow.js model from HTTP:', error);
        throw error;
    }
};

// Preprocess image buffer to 128x128x3 float32 tensor (matching Python preprocessing)
// Supports JPEG buffers using jpeg-js
const preprocessImage = async (imageBuffer) => {
    // Decode JPEG image
    const pixels = jpeg.decode(imageBuffer, true);
    console.log('🔍 Original image dimensions:', pixels.width, 'x', pixels.height);
    console.log('🔍 Image has alpha channel:', pixels.data.length === pixels.width * pixels.height * 4);
    
    let tensor = tf.tensor3d(pixels.data, [pixels.height, pixels.width, 4], 'int32');
    console.log('🔍 Tensor shape after decode:', tensor.shape);
    
    tensor = tf.slice(tensor, [0, 0, 0], [-1, -1, 3]); // Drop alpha
    console.log('🔍 Tensor shape after dropping alpha:', tensor.shape);
    
    // Resize to 128x128 using bilinear interpolation (matching Python)
    tensor = tf.image.resizeBilinear(tensor, [128, 128]);
    console.log('🔍 Tensor shape after resize:', tensor.shape);
    
    // Convert to float32 but DON'T normalize (keep values 0-255)
    tensor = tensor.toFloat();
    console.log('🔍 Tensor shape after toFloat:', tensor.shape);
    
    // Check pixel value range (should be 0-255)
    const minVal = await tensor.min().data();
    const maxVal = await tensor.max().data();
    console.log('🔍 Pixel value range:', minVal[0], 'to', maxVal[0]);
    
    // Check a few sample pixel values
    const samplePixels = await tensor.slice([0, 0, 0], [5, 5, 3]).data();
    console.log('🔍 Sample pixel values (first 5x5x3):', samplePixels);
    
    // Add batch dimension (matching Python np.array([input_arr]))
    tensor = tensor.expandDims(); // [1,128,128,3]
    console.log('🔍 Final tensor shape:', tensor.shape);
    
    // Verify the tensor matches expected input shape
    console.log('🔍 Expected input shape: [1, 128, 128, 3]');
    console.log('🔍 Actual tensor shape:', tensor.shape);
    
    return tensor;
};

// Get prediction from model
export const getPrediction = async (inputTensor) => {
    try {
        if (!model) {
            await loadModel();
        }
        
        let predictions;
        
        // For GraphModel, use execute method
        const rawPredictions = await model.execute(inputTensor);
        
        // Debug: Check raw predictions before processing
        const rawData = await rawPredictions.data();
        console.log('🔍 Raw predictions (first 5):', rawData.slice(0, 5));
        console.log('🔍 Raw predictions range:', Math.min(...rawData), 'to', Math.max(...rawData));
        console.log('🔍 Raw predictions length:', rawData.length);
        
        // Get raw predictions without softmax
        predictions = rawData;
        
        // Convert raw predictions to percentages for logging
        const totalSum = Math.abs(predictions.reduce((a, b) => a + Math.abs(b), 0));
        console.log('🔍 Total sum for percentage calculation:', totalSum);
        
        const percentagePredictions = predictions.map(score => {
            const percentage = (Math.abs(score || 0) / totalSum) * 100;
            return percentage;
        });
        
        console.log('🔍 Percentage predictions (first 5):', percentagePredictions.slice(0, 5));
        
        // Log all class names with their prediction scores
        console.log('🔍 ALL CLASS PREDICTIONS:');
        percentagePredictions.forEach((percentage, index) => {
            const className = CLASS_NAMES[index];
            const rawScore = predictions[index] || 0;
            console.log(`${index + 1}: ${className} - Raw: ${rawScore.toFixed(4)}, Percentage: ${percentage.toFixed(2)}%`);
        });
        
        // Find the class with highest probability (best prediction)
        const maxIndex = predictions.indexOf(Math.max(...predictions));
        const predictedClass = CLASS_NAMES[maxIndex];
        const confidence = (Math.abs(predictions[maxIndex] || 0) / totalSum) * 100;
        
        // Clean up tensors to prevent memory leaks
        rawPredictions.dispose();
        
        return {
            disease: predictedClass,
            confidence: confidence / 100 // Convert percentage back to 0-1 range
        };
    } catch (error) {
        console.error('❌ Prediction error:', error);
        throw error;
    }
};

export { preprocessImage };