import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, login, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/diagnose', label: 'Diagnose' },
    { path: '/history', label: 'History' },
    { path: '/profile', label: 'Profile' }
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🌱</span>
          <span className="brand-text">AgriDoc</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div className="navbar-user">
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button onClick={logout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={login} className="btn btn-primary">
              <span>🔑</span>
              Login with Google
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <button onClick={login} className="btn btn-primary mobile-login-btn">
              Login with Google
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar 