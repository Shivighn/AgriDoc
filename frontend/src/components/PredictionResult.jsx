import React from 'react'
import './PredictionResult.css'

const PredictionResult = ({ prediction, image, onSave, onReset, user }) => {
  const getDiseaseColor = (disease) => {
    if (disease === 'Healthy') return '#4CAF50'
    if (disease.includes('Blight') || disease.includes('Virus')) return '#f44336'
    if (disease.includes('Mold') || disease.includes('Spot')) return '#ff9800'
    return '#2196F3'
  }

  const getDiseaseIcon = (disease) => {
    if (disease === 'Healthy') return '✅'
    if (disease.includes('Blight')) return '🔥'
    if (disease.includes('Virus')) return '🦠'
    if (disease.includes('Mold')) return '🍄'
    if (disease.includes('Spot')) return '🔴'
    if (disease.includes('Mites')) return '🕷️'
    return '🌿'
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50'
    if (confidence >= 0.6) return '#ff9800'
    return '#f44336'
  }

  return (
    <div className="prediction-result">
      <h2 className="section-title">
        <span>🔍</span>
        Diagnosis Results
      </h2>

      <div className="result-content">
        <div className="result-main">
          <div className="result-image">
            <img src={image} alt="Analyzed plant" />
          </div>
          
          <div className="result-details">
            <div className="disease-info">
              <div 
                className="disease-badge"
                style={{ backgroundColor: getDiseaseColor(prediction.disease) }}
              >
                <span className="disease-icon">{getDiseaseIcon(prediction.disease)}</span>
                <span className="disease-name">{prediction.disease}</span>
              </div>
              
              <div className="confidence-meter">
                <div className="confidence-label">
                  <span>Confidence Level</span>
                  <span 
                    className="confidence-value"
                    style={{ color: getConfidenceColor(prediction.confidence) }}
                  >
                    {(prediction.confidence * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${prediction.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(prediction.confidence)
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="result-actions">
              {user && (
                <button onClick={onSave} className="btn btn-primary">
                  <span>💾</span>
                  Save to History
                </button>
              )}
              <button onClick={onReset} className="btn btn-secondary">
                <span>🔄</span>
                New Diagnosis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictionResult 