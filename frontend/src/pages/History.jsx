import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import './History.css'

const History = () => {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const loadHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/history', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(
          (data.reports || []).map(entry => ({
            ...entry,
            prediction: {
              disease: entry.predictedDisease,
              confidence: entry.confidence ? Number(entry.confidence).toFixed(2) : 'N/A'
            }
          }))
        )
      } else {
        throw new Error('Failed to load history')
      }
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const deleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`http://localhost:5000/history/${entryId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setHistory(prev => prev.filter(entry => entry._id !== entryId))
        toast.success('Entry deleted successfully')
      } else {
        throw new Error('Failed to delete entry')
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const dateObj = new Date(timestamp);
    if (isNaN(dateObj)) return '';
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // Use the same disease classes as backend
  const diseaseClasses = [
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

  // Map disease to color/icon based on class name
  const getDiseaseColor = (disease) => {
    if (!disease) return '#2196F3';
    if (disease.includes('healthy')) return '#4CAF50';
    if (disease.includes('Blight') || disease.includes('rust') || disease.includes('scab')) return '#f44336';
    if (disease.includes('Mold') || disease.includes('Spot') || disease.includes('mildew')) return '#ff9800';
    if (disease.includes('Virus')) return '#9c27b0';
    if (disease.includes('mite')) return '#795548';
    return '#2196F3';
  };

  const getDiseaseIcon = (disease) => {
    if (!disease) return '🌿';
    if (disease.includes('healthy')) return '✅';
    if (disease.includes('Blight')) return '🔥';
    if (disease.includes('rust')) return '🌪️';
    if (disease.includes('scab')) return '🟤';
    if (disease.includes('Mold')) return '🍄';
    if (disease.includes('Spot')) return '🔴';
    if (disease.includes('mildew')) return '🌫️';
    if (disease.includes('Virus')) return '🦠';
    if (disease.includes('mite')) return '🕷️';
    return '🌿';
  };

  if (loading) {
    return (
      <div className="history">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your diagnosis history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history">
      <div className="history-container">
        <div className="history-header">
          <h1>Diagnosis History</h1>
          <p>View and manage your past plant disease diagnoses</p>
        </div>

        {history.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">📋</div>
            <h3>No Diagnosis History</h3>
            <p>You haven't saved any diagnoses yet. Start by diagnosing a plant!</p>
          </div>
        ) : (
          <div className="history-content">
            <div className="history-list">
              {history.map((entry) => (
                <div key={entry._id} className="history-entry">
                  <div className="entry-details">
                    <div className="entry-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                      <div 
                        className="disease-badge"
                        style={{ backgroundColor: getDiseaseColor(entry.prediction?.disease) }}
                      >
                        <span className="disease-icon">
                          {getDiseaseIcon(entry.prediction?.disease)}
                        </span>
                        <span className="disease-name">
                          {entry.prediction?.disease || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="entry-actions" style={{ flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                        <button
                          onClick={() => {
                            setSelectedEntry(entry)
                            setShowChat(true)
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <span>💬</span>
                          View Chat
                        </button>
                        <button
                          onClick={() => deleteEntry(entry._id)}
                          className="btn btn-danger btn-sm"
                        >
                          <span>🗑️</span>
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="entry-info">
                      <div className="confidence-info">
                        <span>Confidence: {entry.prediction?.confidence || 'N/A'}%</span>
                      </div>
                      <div className="date-info">
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                    </div>
                    
                    {entry.chatHistory && entry.chatHistory.length > 0 && (
                      <div className="chat-summary">
                        <span>💬 {entry.chatHistory.length} messages</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedEntry && showChat && (
              <div className="chat-modal">
                <div className="chat-modal-content">
                  <div className="chat-modal-header">
                    <h3>Chat History - {selectedEntry.prediction?.disease}</h3>
                    <button
                      onClick={() => {
                        setShowChat(false)
                        setSelectedEntry(null)
                      }}
                      className="close-btn"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="chat-modal-body">
                    {selectedEntry.chatHistory && selectedEntry.chatHistory.length > 0 ? (
                      <div className="chat-history">
                        {selectedEntry.chatHistory.map((msg, index) => (
                          <div key={index} className={`chat-message ${msg.role}`}>
                            <div className="chat-avatar">
                              {msg.role === 'user' ? '👤' : '🌱'}
                            </div>
                            <div className="chat-content">
                              <div className="chat-text">{msg.content}</div>
                              <div className="chat-time">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-chat">
                        <p>No chat history available for this diagnosis.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default History 