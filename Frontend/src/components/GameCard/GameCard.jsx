import { useState } from "react"
import "./GameCard.css"

function GameCard({ title, image, views, isNew, rating }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="game-card" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="game-image-container">
        <img src={image || "/placeholder.svg"} alt={title} className="game-image" />
        {isNew && <span className="new-badge">New</span>}
        {/* {isHovered && (
          <div className="game-overlay">
            <button className="play-btn">View</button>
          </div>
        )} */}
      </div>
      <div className="game-info">
        <h3>{title}</h3>
        <div className="game-stats">
          <div className="views-counter">
            <svg viewBox="0 0 24 24">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{views.toLocaleString()}</span>
          </div>
          {rating && (
            <div className="rating">
              <svg viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameCard

