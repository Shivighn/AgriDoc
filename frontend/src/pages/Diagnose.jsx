import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import ImageUpload from '../components/ImageUpload'
import PredictionResult from '../components/PredictionResult'
import PlantDoctorChat from '../components/PlantDoctorChat'
import './Diagnose.css'
import * as tf from '@tensorflow/tfjs'

const Diagnose = () => {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [currentReportId, setCurrentReportId] = useState(null)

  // Preprocess image to 128x128x3 float32 normalized and flatten
  const preprocessImage = async (imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const tensor = tf.browser.fromPixels(img)
            .resizeBilinear([128, 128])
            .toFloat()
            .div(255.0)
            .expandDims(0); // [1, 128, 128, 3]
          const flat = Array.from(tensor.dataSync());
          tensor.dispose();
          resolve(flat);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  };

  const predictDisease = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first')
      return
    }

    setIsLoading(true)
    try {
      // Preprocess the image to a flat tensor array
      const tensorArray = await preprocessImage(selectedImage);
      // Send to backend as JSON
      const predictResponse = await fetch('https://agridoc-backend.onrender.com/disease/analyze', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tensor: tensorArray })
      })

      if (!predictResponse.ok) {
        throw new Error('Prediction failed')
      }

      const result = await predictResponse.json()
      setCurrentReportId(result.report._id)
      const predictionResult = {
        disease: result.report.predictedDisease || 'Unknown',
        confidence: result.report.confidence,
        probabilities: []
      }
      setPrediction(predictionResult)
      setShowChat(true)
      toast.success('Disease detected successfully!')
    } catch (error) {
      console.error('Prediction error:', error)
      toast.error('Error during prediction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveToHistory = async () => {
    if (!user || !prediction || !currentReportId) return

    try {
      const response = await fetch('https://agridoc-backend.onrender.com/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reportId: currentReportId,
          chatHistory: chatHistory
        })
      })

      if (response.ok) {
        toast.success('Saved to history!')
      } else {
        toast.error('Failed to save to history')
      }
    } catch (error) {
      console.error('Error saving to history:', error)
      toast.error('Failed to save to history')
    }
  }

  const resetDiagnosis = () => {
    setSelectedImage(null)
    setPrediction(null)
    setChatHistory([])
    setShowChat(false)
    setCurrentReportId(null)
  }

  return (
    <div className="diagnose">
      <div className="diagnose-container">
        <div className="diagnose-header">
          <h1>Plant Disease Diagnosis</h1>
          <p>Upload a clear photo of your plant's affected area for AI-powered disease detection</p>
        </div>

        <div className="diagnose-content">
          {/* Image Upload Section */}
          <div className="upload-section">
            <ImageUpload
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              onPredict={predictDisease}
              isLoading={isLoading}
            />
          </div>

          {/* Prediction Result Section */}
          {prediction && (
            <div className="result-section">
              <PredictionResult
                prediction={prediction}
                image={selectedImage}
                onSave={saveToHistory}
                onReset={resetDiagnosis}
                user={user}
              />
            </div>
          )}

          {/* Plant Doctor Chat Section */}
          {showChat && prediction && (
            <div className="chat-section">
              <PlantDoctorChat
                disease={prediction.disease}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Diagnose 