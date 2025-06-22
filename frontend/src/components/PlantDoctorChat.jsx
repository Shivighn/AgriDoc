import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import './PlantDoctorChat.css'

const PlantDoctorChat = ({ disease, chatHistory, setChatHistory }) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setChatHistory(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          disease: disease,
          message: message,
          chatHistory: chatHistory
        })
      })

      if (response.ok) {
        const data = await response.json()
        const doctorMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        }
        setChatHistory(prev => [...prev, doctorMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to get response from Plant Doctor')
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble responding right now. Please try again later.',
        timestamp: new Date().toISOString(),
        isError: true
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getSuggestedQuestions = () => {
    const suggestions = [
      `What are the symptoms of ${disease}?`,
      `How can I treat ${disease}?`,
      `What causes ${disease}?`,
      `How can I prevent ${disease} in the future?`,
      `Are there any natural remedies for ${disease}?`
    ]
    return suggestions
  }

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion)
  }

  return (
    <div className="plant-doctor-chat">
      <h2 className="section-title">
        <span>👨‍⚕️</span>
        Plant Doctor Chat
      </h2>

      <div className="chat-container">
        <div className="chat-header">
          <div className="doctor-info">
            <div className="doctor-avatar">🌱</div>
            <div className="doctor-details">
              <h3>Dr. Plant</h3>
              <p>Your AI Plant Health Expert</p>
            </div>
          </div>
          <div className="disease-context">
            <span className="disease-tag">Diagnosis: {disease}</span>
          </div>
        </div>

        <div className="chat-messages">
          {chatHistory.length === 0 ? (
            <div className="welcome-row" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', width: '100%' }}>
              <div className="welcome-message" style={{ flex: 1 }}>
                <div className="welcome-content">
                  <div className="welcome-icon">👋</div>
                  <h3>Hello! I'm Dr. Plant</h3>
                  <p>I can help you understand and treat {disease}. Ask me anything about:</p>
                  <ul>
                    <li>Disease symptoms and causes</li>
                    <li>Treatment options and remedies</li>
                    <li>Prevention strategies</li>
                    <li>Care recommendations</li>
                  </ul>
                </div>
              </div>
              <div className="suggested-questions" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4>Suggested Questions:</h4>
                <div className="suggestions">
                  {getSuggestedQuestions().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-btn"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
              >
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🌱'}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🌱</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="input-container">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Dr. Plant about your plant's health..."
              disabled={isLoading}
              rows="1"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <span>📤</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlantDoctorChat 