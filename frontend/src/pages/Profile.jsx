import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

const Profile = () => {
  const { user, logout } = useAuth()
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const fetchSavedCount = async () => {
      if (!user) return
      try {
        const response = await fetch('https://agridoc-backend.onrender.com/history', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setSavedCount((data.reports || []).length)
        }
      } catch (error) {
        setSavedCount(0)
      }
    }
    fetchSavedCount()
  }, [user])

  if (!user) {
    return (
      <div className="profile">
        <div className="loading-container">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account and preferences</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-details">
              <div className="detail-section">
                <h3>Account Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{user.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>AgriDoc Features</h3>
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">🔍</span>
                    <div className="feature-info">
                      <span className="feature-name">AI Disease Detection</span>
                      <span className="feature-desc">Upload plant images for instant diagnosis</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <div className="feature-info">
                      <span className="feature-name">Plant Doctor Chat</span>
                      <span className="feature-desc">Get expert advice on plant care</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <div className="feature-info">
                      <span className="feature-name">Diagnosis History</span>
                      <span className="feature-desc">Track all your plant diagnoses</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💾</span>
                    <div className="feature-info">
                      <span className="feature-name">Save & Share</span>
                      <span className="feature-desc">Save diagnoses and chat conversations</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Account Actions</h3>
                <div className="action-buttons">
                  <button onClick={logout} className="btn btn-danger">
                    <span>🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-sidebar">
            <div className="sidebar-card">
              <h3>Quick Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{savedCount}</span>
                  <span className="stat-label">Saved</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Tips for Better Results</h3>
              <ul className="tips-list">
                <li>Take clear, well-lit photos</li>
                <li>Focus on the affected area</li>
                <li>Use a plain background</li>
                <li>Ask specific questions in chat</li>
                <li>Use only appropriate images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 