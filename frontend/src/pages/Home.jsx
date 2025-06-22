import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import './Home.css'

const Home = () => {
  const { user, login } = useAuth()

  const handleDiagnoseClick = (e) => {
    if (!user) {
      e.preventDefault()
      toast.error('Please log in to access disease diagnosis')
      return false
    }
  }

  const features = [
    {
      icon: '🔍',
      title: 'AI-Powered Diagnosis',
      description: 'Upload a photo of your plant and get instant disease detection using advanced machine learning.'
    },
    {
      icon: '💬',
      title: 'Plant Doctor Chat',
      description: 'Ask questions about detected diseases and get personalized treatment recommendations.'
    },
    {
      icon: '📊',
      title: 'History Tracking',
      description: 'Keep track of all your plant diagnoses and treatment plans in one place.'
    },
    {
      icon: '🌱',
      title: 'Expert Knowledge',
      description: 'Access comprehensive information about plant diseases and their treatments.'
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Upload Image',
      description: 'Take a clear photo of your plant\'s affected area and upload it to our system.'
    },
    {
      step: 2,
      title: 'AI Analysis',
      description: 'Our advanced AI model analyzes the image to detect diseases with high accuracy.'
    },
    {
      step: 3,
      title: 'Get Results',
      description: 'Receive detailed diagnosis and treatment recommendations for your plant.'
    },
    {
      step: 4,
      title: 'Chat with Expert',
      description: 'Ask follow-up questions and get personalized advice from our plant doctor.'
    }
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Plant's Health <span className="highlight">Guardian</span>
          </h1>
          <p className="hero-subtitle">
            Diagnose plant diseases instantly with AI-powered technology and get expert treatment advice
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/diagnose" className="btn btn-primary btn-large">
                <span>🔍</span>
                Start Diagnosis
              </Link>
            ) : (
              <button onClick={login} className="btn btn-primary btn-large">
                <span>🔑</span>
                Login to Start
              </button>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="plant-illustration">
            <span className="plant-icon">🌿</span>
            <div className="health-indicator">
              <span className="pulse"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose AgriDoc?</h2>
          <p>Advanced technology meets expert knowledge for the best plant care</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get your plant diagnosis in just a few simple steps</p>
        </div>
        <div className="steps-container">
          {howItWorks.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.step}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Diagnose Your Plants?</h2>
          <p>Join thousands of gardeners who trust AgriDoc for their plant care</p>
          {user ? (
            <Link to="/diagnose" className="btn btn-primary btn-large">
              <span>🚀</span>
              Get Started Now
            </Link>
          ) : (
            <button onClick={login} className="btn btn-primary btn-large">
              <span>🔑</span>
              Login to Get Started
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home 