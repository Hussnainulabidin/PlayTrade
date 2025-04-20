"use client"

import { useState, useRef, useEffect } from "react"
import "./Header.css"
import { LoginModal } from "../LoginModal/LoginModal"
import { SignupModal } from "../SignupModal/SignupModal"
import { UserMenu } from "../UserMenu/UserMenu"

function Header({ darkMode, setDarkMode, isLoggedIn, userRole, onLogout, onLoginSuccess }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <img src="images/a.png" alt="Game Boost" className="logo" />
          <button className="select-game-btn">
            <span>Select Game</span>
            <svg className="arrow-icon" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="header-right">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              <svg className="sun-icon" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="moon-icon" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
          <div className="language-selector">
            <img src="https://flagcdn.com/gb.svg" alt="English" className="flag-icon" />
            <span>English</span>
            <span className="divider">/</span>
            <span>USD</span>
          </div>

          {isLoggedIn ? (
            <div className="user-profile-container" ref={userMenuRef}>
              <button
                className="profile-icon-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User menu"
              >
                <div className="profile-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {userRole === "admin" && <span className="admin-badge">Admin</span>}
              </button>

              {isUserMenuOpen && <UserMenu onLogout={onLogout} userRole={userRole} />}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>
              Log in
            </button>
          )}
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        switchToSignup={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
        onLoginSuccess={onLoginSuccess}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        switchToLogin={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
        onLoginSuccess={onLoginSuccess}
      />
    </header>
  )
}

export default Header

