"use client"

import { useState, useEffect } from "react"
import "./App.css"
import Header from "./components/Header/Header"
import SearchBar from "./components/SearchBar/SearchBar"
import AccountsSection from "./components/AccountsSection/AccountsSection"
import GamesSection from "./components/GamesSection/GamesSection"
import AdminDashboard from "./components/AdminDashboard/AdminDashboard"

function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)

      // Fetch user role from API
      const fetchUserRole = async () => {
        try {
          const response = await fetch("http://localhost:3003/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            const role = data.role || "user"
            setUserRole(role)
            localStorage.setItem("userRole", role)

            if (role === "admin") {
              setShowAdminDashboard(true)
            }
          } else {
            // Fallback to stored role if API fails
            const storedRole = localStorage.getItem("userRole")
            if (storedRole) {
              setUserRole(storedRole)
              if (storedRole === "admin") {
                setShowAdminDashboard(true)
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
          // Fallback to stored role if API fails
          const storedRole = localStorage.getItem("userRole")
          if (storedRole) {
            setUserRole(storedRole)
            if (storedRole === "admin") {
              setShowAdminDashboard(true)
            }
          }
        }
      }

      fetchUserRole()
    }
  }, [])

  // Function to handle successful login
  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true)
    setUserRole(role)
    if (role === "admin") {
      setShowAdminDashboard(true)
      localStorage.setItem("userRole", role)
    }
  }

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setShowAdminDashboard(false)
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
  }

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onLogout={handleLogout}
        onLoginSuccess={handleLoginSuccess}
      />
      <div className="flex">
        {showAdminDashboard ? (
          <AdminDashboard />
        ) : (
          <main className="main-content flex-1">
            <div className="top-section">
              {!showSearchResults && <AccountsSection />}
              <SearchBar setShowSearchResults={setShowSearchResults} />
            </div>
            {!showSearchResults && (
              <>
                <GamesSection title="Trending Games" trending={true} />
                <GamesSection title="All Games" />
                {/* <GameList /> */}
              </>
            )}
          </main>
        )}
      </div>
    </div>
  )
}

export default App

