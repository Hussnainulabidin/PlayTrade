"use client"
import { Search, Gamepad, Tag, Star, Server, Award, Percent, Calendar, List } from "lucide-react"
import "./FilterBar.css"

const FilterBar = ({ onSearch, onFilterChange, searchQuery, filters }) => {
    return (
        <div className="filter-bar">
            <div className="search-container">
                <Search size={16} className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="filters">
                <button className="filter-btn">
                    <Gamepad size={16} />
                    <span>Game</span>
                </button>
                <button className="filter-btn">
                    <Tag size={16} />
                    <span>Status</span>
                </button>
                <button className="filter-btn">
                    <Star size={16} />
                    <span>Rating</span>
                </button>
                <button className="filter-btn">
                    <Server size={16} />
                    <span>Server</span>
                </button>
                <button className="filter-btn">
                    <Award size={16} />
                    <span>Featured</span>
                </button>
                <button className="filter-btn">
                    <Percent size={16} />
                    <span>Discounted</span>
                </button>
                <button className="filter-btn">
                    <Calendar size={16} />
                    <span>Date</span>
                </button>
                <button className="view-btn">
                    <List size={16} />
                    <span>View</span>
                </button>
            </div>


        </div>
    )
}

export default FilterBar
