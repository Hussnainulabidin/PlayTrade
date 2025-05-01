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
        <div className="pt-filter-bar">
            <div className="pt-filter-bar__search-container">
                <Search size={16} className="pt-filter-bar__search-icon" />
                <input
                    type="text"
                    className="pt-filter-bar__search-input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div className="pt-filter-bar__filters">
                <button
                    className={`pt-filter-btn ${selectedGames.length > 0 ? 'pt-filter-btn--active' : ''}`}
                    onClick={() => setGameModalOpen(true)}
                >
                    <Gamepad size={16} />
                    <span>Game {selectedGames.length > 0 && `(${selectedGames.length})`}</span>
                </button>
                <button
                    className={`pt-filter-btn ${selectedStatuses.length > 0 ? 'pt-filter-btn--active' : ''}`}
                    onClick={() => setStatusModalOpen(true)}
                >
                    <Tag size={16} />
                    <span>Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}</span>
                </button>
                <button
                    className={`pt-filter-btn ${(dateRange.startDate || dateRange.endDate) ? 'pt-filter-btn--active' : ''}`}
                    onClick={() => setDateModalOpen(true)}
                >
                    <Calendar size={16} />
                    <span>Date</span>
                </button>

                {hasActiveFilters() && (
                    <button
                        className="pt-filter-btn pt-filter-btn--reset"
                        onClick={resetAllFilters}
                    >
                        <RefreshCw size={16} />
                        <span>Reset All</span>
                    </button>
                )}
            </div>

            {/* Game Modal */}
            {gameModalOpen && (
                <div className="pt-modal-overlay" onClick={() => setGameModalOpen(false)}>
                    <div className="pt-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="pt-modal-header">
                            <h3 className="pt-modal-title">Filter by Game</h3>
                            <button className="pt-close-button" onClick={() => setGameModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pt-modal-body">
                            <div className="pt-filter-options">
                                {games.map(game => (
                                    <div
                                        key={game}
                                        className={`pt-filter-option ${selectedGames.includes(game) ? 'pt-filter-option--selected' : ''}`}
                                        onClick={() => toggleGameSelection(game)}
                                    >
                                        <div className="pt-option-checkbox">
                                            {selectedGames.includes(game) && <Check size={16} />}
                                        </div>
                                        <span>{game}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-modal-footer">
                            <button className="pt-modal-btn pt-modal-btn--reset" onClick={resetGameFilter}>
                                Reset
                            </button>
                            <button className="pt-modal-btn pt-modal-btn--apply" onClick={applyGameFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {statusModalOpen && (
                <div className="pt-modal-overlay" onClick={() => setStatusModalOpen(false)}>
                    <div className="pt-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="pt-modal-header">
                            <h3 className="pt-modal-title">Filter by Status</h3>
                            <button className="pt-close-button" onClick={() => setStatusModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pt-modal-body">
                            <div className="pt-filter-options">
                                {statuses.map(status => (
                                    <div
                                        key={status}
                                        className={`pt-filter-option ${isStatusSelected(status) ? 'pt-filter-option--selected' : ''}`}
                                        onClick={() => toggleStatusSelection(status)}
                                    >
                                        <div className="pt-option-checkbox">
                                            {isStatusSelected(status) && <Check size={16} />}
                                        </div>
                                        <span>{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-modal-footer">
                            <button className="pt-modal-btn pt-modal-btn--reset" onClick={resetStatusFilter}>
                                Reset
                            </button>
                            <button className="pt-modal-btn pt-modal-btn--apply" onClick={applyStatusFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Modal */}
            {dateModalOpen && (
                <div className="pt-modal-overlay" onClick={() => setDateModalOpen(false)}>
                    <div className="pt-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="pt-modal-header">
                            <h3 className="pt-modal-title">Filter by Date</h3>
                            <button className="pt-close-button" onClick={() => setDateModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="pt-modal-body">
                            <div className="pt-date-range">
                                <div className="pt-date-field">
                                    <label htmlFor="startDate">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        className="pt-date-input"
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                    />
                                </div>
                                <div className="pt-date-field">
                                    <label htmlFor="endDate">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        className="pt-date-input"
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-modal-footer">
                            <button className="pt-modal-btn pt-modal-btn--reset" onClick={resetDateFilter}>
                                Reset
                            </button>
                            <button className="pt-modal-btn pt-modal-btn--apply" onClick={applyDateFilter}>
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
