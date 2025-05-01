"use client"
import { useState, useEffect } from "react"
import { Search, Gamepad, Tag, Star, Server, Award, Percent, Calendar, List, X, Check, RefreshCw } from "lucide-react"
import "./SellerFilterbar.css"

const FilterBar = ({ onSearch, onFilterChange, searchQuery, filters = {} }) => {
    const [gameModalOpen, setGameModalOpen] = useState(false)
    const [statusModalOpen, setStatusModalOpen] = useState(false)
    const [dateModalOpen, setDateModalOpen] = useState(false)

    const [selectedGames, setSelectedGames] = useState(filters.games || [])
    const [selectedStatuses, setSelectedStatuses] = useState(filters.statuses || [])
    const [dateRange, setDateRange] = useState({
        startDate: filters.startDate || "",
        endDate: filters.endDate || ""
    })

    // Update local state when filter props change
    useEffect(() => {
        setSelectedGames(filters.games || [])
        setSelectedStatuses(filters.statuses || [])
        setDateRange({
            startDate: filters.startDate || "",
            endDate: filters.endDate || ""
        })
    }, [filters])

    const games = [
        "Valorant",
        "Clash of Clans",
        "Fortnite",
        "League of Legends",
        "Brawl Stars"
    ]

    const statuses = [
        "Active",
        "Sold",
        "Draft"
    ]

    // Check if any filter is active
    const hasActiveFilters = () => {
        return (
            selectedGames.length > 0 ||
            selectedStatuses.length > 0 ||
            dateRange.startDate ||
            dateRange.endDate ||
            searchQuery
        );
    }

    const toggleGameSelection = (game) => {
        if (selectedGames.includes(game)) {
            setSelectedGames(selectedGames.filter(g => g !== game))
        } else {
            setSelectedGames([...selectedGames, game])
        }
    }

    const toggleStatusSelection = (status) => {
        if (selectedStatuses.includes(status.toLowerCase())) {
            setSelectedStatuses(selectedStatuses.filter(s => s !== status.toLowerCase()))
        } else {
            setSelectedStatuses([...selectedStatuses, status.toLowerCase()])
        }
    }

    const handleDateChange = (e) => {
        setDateRange({
            ...dateRange,
            [e.target.name]: e.target.value
        })
    }

    const applyGameFilter = () => {
        onFilterChange({
            ...filters,
            games: selectedGames
        })
        setGameModalOpen(false)
    }

    const applyStatusFilter = () => {
        onFilterChange({
            ...filters,
            statuses: selectedStatuses
        })
        setStatusModalOpen(false)
    }

    const applyDateFilter = () => {
        onFilterChange({
            ...filters,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        })
        setDateModalOpen(false)
    }

    const resetAllFilters = () => {
        onFilterChange({
            games: [],
            statuses: [],
            startDate: "",
            endDate: ""
        })
        onSearch("")
    }

    const resetGameFilter = () => {
        setSelectedGames([])
    }

    const resetStatusFilter = () => {
        setSelectedStatuses([])
    }

    const resetDateFilter = () => {
        setDateRange({
            startDate: "",
            endDate: ""
        })
    }

    const handleSearchChange = (value) => {
        onSearch(value)
    }

    // Helper to check if a status is selected (handling lowercase conversion)
    const isStatusSelected = (status) => {
        return selectedStatuses.includes(status.toLowerCase());
    }

    return (
        <div className="filter-bar">
            <div className="filter-bar-search-container">
                <Search size={16} className="filter-bar-search-icon" />
                <input
                    type="text"
                    className="filter-bar-search-input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div className="filter-bar-filters">
                <button
                    className={`filter-btn ${selectedGames.length > 0 ? 'filter-btn-active' : ''}`}
                    onClick={() => setGameModalOpen(true)}
                >
                    <Gamepad size={16} />
                    <span>Game {selectedGames.length > 0 && `(${selectedGames.length})`}</span>
                </button>
                <button
                    className={`filter-btn ${selectedStatuses.length > 0 ? 'filter-btn-active' : ''}`}
                    onClick={() => setStatusModalOpen(true)}
                >
                    <Tag size={16} />
                    <span>Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}</span>
                </button>
                <button
                    className={`filter-btn ${(dateRange.startDate || dateRange.endDate) ? 'filter-btn-active' : ''}`}
                    onClick={() => setDateModalOpen(true)}
                >
                    <Calendar size={16} />
                    <span>Date</span>
                </button>

                {hasActiveFilters() && (
                    <button
                        className="filter-btn filter-btn-reset"
                        onClick={resetAllFilters}
                    >
                        <RefreshCw size={16} />
                        <span>Reset All</span>
                    </button>
                )}
            </div>

            {/* Game Modal */}
            {gameModalOpen && (
                <div className="modal-overlay" onClick={() => setGameModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Filter by Game</h3>
                            <button className="close-button" onClick={() => setGameModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="filter-options">
                                {games.map(game => (
                                    <div
                                        key={game}
                                        className={`filter-option ${selectedGames.includes(game) ? 'filter-option-selected' : ''}`}
                                        onClick={() => toggleGameSelection(game)}
                                    >
                                        <div className="option-checkbox">
                                            {selectedGames.includes(game) && <Check size={16} />}
                                        </div>
                                        <span>{game}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-reset" onClick={resetGameFilter}>
                                Reset
                            </button>
                            <button className="modal-btn modal-btn-apply" onClick={applyGameFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {statusModalOpen && (
                <div className="modal-overlay" onClick={() => setStatusModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Filter by Status</h3>
                            <button className="close-button" onClick={() => setStatusModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="filter-options">
                                {statuses.map(status => (
                                    <div
                                        key={status}
                                        className={`filter-option ${isStatusSelected(status) ? 'filter-option-selected' : ''}`}
                                        onClick={() => toggleStatusSelection(status)}
                                    >
                                        <div className="option-checkbox">
                                            {isStatusSelected(status) && <Check size={16} />}
                                        </div>
                                        <span>{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-reset" onClick={resetStatusFilter}>
                                Reset
                            </button>
                            <button className="modal-btn modal-btn-apply" onClick={applyStatusFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Modal */}
            {dateModalOpen && (
                <div className="modal-overlay" onClick={() => setDateModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Filter by Date</h3>
                            <button className="close-button" onClick={() => setDateModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="date-range">
                                <div className="date-field">
                                    <label htmlFor="startDate">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        className="date-input"
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                    />
                                </div>
                                <div className="date-field">
                                    <label htmlFor="endDate">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        className="date-input"
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-reset" onClick={resetDateFilter}>
                                Reset
                            </button>
                            <button className="modal-btn modal-btn-apply" onClick={applyDateFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FilterBar
