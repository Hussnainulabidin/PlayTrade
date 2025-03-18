"use client"

import { useState } from "react"
import "../App.css"
import Header from "../components/Header/Header"
import SearchBar from "../components/SearchBar/SearchBar"
import AccountsSection from "../components/AccountsSection/AccountsSection"
import GamesSection from "../components/GamesSection/GamesSection"
// import GameList from "../components/GameList/GameList"

function Dashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)

  // Handle login success
  const handleLoginSuccess = (role) => {
    setIsLoggedIn(true)
    setUserRole(role)
  }

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
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
      </div>
    </div>
  )
}

export default Dashboard

