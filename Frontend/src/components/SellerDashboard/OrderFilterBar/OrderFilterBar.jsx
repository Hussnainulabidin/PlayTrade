"use client"
import { useState, useEffect } from "react"
import { Search, Gamepad, Tag, Calendar, X, Check, RefreshCw } from "lucide-react"
import "./OrderFilterbar.css"

const OrderFilterBar = ({ onSearch, onFilterChange, searchQuery, filters = {} }) => {
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
        "Processing",
        "Completed"
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
        <div className="order-filter-bar">
            <div className="order-filter-bar-search-container">
                <Search size={16} className="order-filter-bar-search-icon" />
                <input
                    type="text"
                    className="order-filter-bar-search-input"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div className="order-filter-bar-filters">
                <button
                    className={`order-filter-btn ${selectedGames.length > 0 ? 'order-filter-btn-active' : ''}`}
                    onClick={() => setGameModalOpen(true)}
                >
                    <Gamepad size={16} />
                    <span>Game {selectedGames.length > 0 && `(${selectedGames.length})`}</span>
                </button>
                <button
                    className={`order-filter-btn ${selectedStatuses.length > 0 ? 'order-filter-btn-active' : ''}`}
                    onClick={() => setStatusModalOpen(true)}
                >
                    <Tag size={16} />
                    <span>Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}</span>
                </button>
                <button
                    className={`order-filter-btn ${(dateRange.startDate || dateRange.endDate) ? 'order-filter-btn-active' : ''}`}
                    onClick={() => setDateModalOpen(true)}
                >
                    <Calendar size={16} />
                    <span>Date</span>
                </button>

                {hasActiveFilters() && (
                    <button
                        className="order-filter-btn order-filter-btn-reset"
                        onClick={resetAllFilters}
                    >
                        <RefreshCw size={16} />
                        <span>Reset All</span>
                    </button>
                )}
            </div>

            {/* Game Modal */}
            {gameModalOpen && (
                <div className="order-modal-overlay" onClick={() => setGameModalOpen(false)}>
                    <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h3 className="order-modal-title">Filter by Game</h3>
                            <button className="order-close-button" onClick={() => setGameModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="order-modal-body">
                            <div className="order-filter-options">
                                {games.map(game => (
                                    <div
                                        key={game}
                                        className={`order-filter-option ${selectedGames.includes(game) ? 'order-filter-option-selected' : ''}`}
                                        onClick={() => toggleGameSelection(game)}
                                    >
                                        <div className="order-option-checkbox">
                                            {selectedGames.includes(game) && <Check size={16} />}
                                        </div>
                                        <span>{game}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-modal-footer">
                            <button className="order-modal-btn order-modal-btn-reset" onClick={resetGameFilter}>
                                Reset
                            </button>
                            <button className="order-modal-btn order-modal-btn-apply" onClick={applyGameFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {statusModalOpen && (
                <div className="order-modal-overlay" onClick={() => setStatusModalOpen(false)}>
                    <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h3 className="order-modal-title">Filter by Status</h3>
                            <button className="order-close-button" onClick={() => setStatusModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="order-modal-body">
                            <div className="order-filter-options">
                                {statuses.map(status => (
                                    <div
                                        key={status}
                                        className={`order-filter-option ${isStatusSelected(status) ? 'order-filter-option-selected' : ''}`}
                                        onClick={() => toggleStatusSelection(status)}
                                    >
                                        <div className="order-option-checkbox">
                                            {isStatusSelected(status) && <Check size={16} />}
                                        </div>
                                        <span>{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-modal-footer">
                            <button className="order-modal-btn order-modal-btn-reset" onClick={resetStatusFilter}>
                                Reset
                            </button>
                            <button className="order-modal-btn order-modal-btn-apply" onClick={applyStatusFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Modal */}
            {dateModalOpen && (
                <div className="order-modal-overlay" onClick={() => setDateModalOpen(false)}>
                    <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h3 className="order-modal-title">Filter by Date</h3>
                            <button className="order-close-button" onClick={() => setDateModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="order-modal-body">
                            <div className="order-date-inputs">
                                <div className="order-date-field">
                                    <label htmlFor="startDate">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                        className="order-date-input"
                                    />
                                </div>
                                <div className="order-date-field">
                                    <label htmlFor="endDate">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                        className="order-date-input"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="order-modal-footer">
                            <button className="order-modal-btn order-modal-btn-reset" onClick={resetDateFilter}>
                                Reset
                            </button>
                            <button className="order-modal-btn order-modal-btn-apply" onClick={applyDateFilter}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderFilterBar 