"use client"

import { useState } from "react"
import "./SearchBar.css"
import GameCard from "../GameCard/GameCard"

const API_URL = "http://localhost:5000/api/search"

function SearchBar({ setShowSearchResults }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setError(null)
    setShowSearchResults(true)
    setHasSearched(true)

    try {
      const searchUrl = `${API_URL}/?searchTerm=${searchTerm}`
      const response = await fetch(searchUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      const gamesData = data.results || data
      setGames(gamesData)
    } catch (error) {
      console.error("Error fetching games:", error)
      setError("Failed to fetch games. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setGames([])
    setShowSearchResults(false)
    setHasSearched(false)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          placeholder="Search games..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="search-button">
          <svg className="search-icon" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        {searchTerm && (
          <button type="button" className="clear-button" onClick={clearSearch}>
            Clear
          </button>
        )}
      </form>

      {loading && <div className="loading-bar">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {hasSearched && (
        <div className="games-section">
          <div className="section-header">
            <h2>Search Results</h2>
          </div>
          <div className="games-grid">
            {games.length > 0
              ? games.map((game) => (
                  <GameCard
                    key={game.id}
                    title={game.name}
                    image={game.image?.medium_url}
                    views={100}
                    rating={game.vote_average}
                  />
                ))
              : !loading && <p>No games found. Try a different search term.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar

