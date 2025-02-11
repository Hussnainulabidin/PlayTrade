'use client';

import React, { useState, useEffect } from 'react';
import './GameList.css';

const API_URL = 'http://localhost:5000/api/games';


function GameList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        setGames(data.results);
      } catch (error) {
        setError(`Error fetching games: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchGames();
  }, []);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="game-list">
      <h2>Popular Games</h2>
      <br></br>
      <div className="game-grid">
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <img
              src={game.image?.medium_url || 'https://via.placeholder.com/150'}
              alt={game.name}
              className="game-poster"
            />
            <h3>{game.name}</h3>
            <p>Rating: {game.vote_average || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameList;
