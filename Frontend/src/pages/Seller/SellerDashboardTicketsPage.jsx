"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Plus } from "lucide-react"
import { Input } from "../../components/AdminDashboard/ui/input"
import axios from "axios"
import "../Admin/tickets.css"

function SellerDashboardTicketsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeFilter, setActiveFilter] = useState("all")

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`http://localhost:3003/tickets/seller/${localStorage.getItem('userId')}?filter=${activeFilter}`)
                setTickets(response.data.data.tickets)
            } catch (err) {
                console.error("Error fetching tickets:", err)
                setError("Failed to fetch tickets. Please try again later.")
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [activeFilter])

    const filteredTickets = tickets.filter(
        (ticket) =>
            ticket._id?.includes(searchQuery) ||
            ticket.ticketType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.status?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loader-spinner"></div>
                <div className="loader-text">Loading tickets...</div>
            </div>
        )
    }

    if (error) {
        return <div className="error-state">{error}</div>
    }

    return (
        <div className="listings-container">
            <div className="listings-header">
                <h1 className="listings-title">Support Tickets</h1>
                <div className="header-buttons">
                    <Link to="/seller-dashboard/tickets/new">
                        <button className="add-new-button">
                            <Plus size={18} />
                            New Ticket
                        </button>
                    </Link>
                </div>
            </div>

            <div className="listings-toolbar">
                <div className="search-container">
                    <Search className="search-icon" />
                    <Input
                        placeholder="Search tickets..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="filter-buttons-left">
                <button
                    className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All Tickets
                </button>
                <button
                    className={`filter-button ${activeFilter === 'open' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('open')}
                >
                    Open
                </button>
                <button
                    className={`filter-button ${activeFilter === 'closed' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('closed')}
                >
                    Closed
                </button>
            </div>

            <div className="listings-table">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table-header">TICKET ID</th>
                            <th className="table-header">TYPE</th>
                            <th className="table-header">STATUS</th>
                            <th className="table-header">ASSIGNED TO</th>
                            <th className="table-header">CREATED</th>
                            <th className="table-header">LAST ACTIVITY</th>
                            <th className="table-header">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.map((ticket) => (
                            <tr key={ticket._id} className="table-row">
                                <td className="table-cell listing-id">
                                    <Link to={`/seller-tickets/${ticket._id}`} className="seller-link">
                                        #{ticket._id.slice(-6)}
                                    </Link>
                                </td>
                                <td className="table-cell">
                                    <span className={`status-badge ${ticket.ticketType === "Marketplace Issue"
                                        ? "badge-purple"
                                        : ticket.ticketType === "Order Issue"
                                            ? "badge-blue"
                                            : "badge-gray"
                                        }`}>
                                        {ticket.ticketType}
                                    </span>
                                </td>
                                <td className="table-cell">
                                    <span className={`status-badge ${ticket.status === "Open"
                                        ? "badge-listed"
                                        : ticket.status === "In Progress"
                                            ? "badge-draft"
                                            : "badge-other"
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="table-cell">
                                    <div className="admin-info">
                                        <span className="admin-name">{ticket.assignedAdmin?.username || "Unassigned"}</span>
                                    </div>
                                </td>
                                <td className="table-cell">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                <td className="table-cell">{new Date(ticket.lastActivity).toLocaleDateString()}</td>
                                <td className="table-cell actions-cell">
                                    <Link to={`/seller-tickets/${ticket._id}`}>
                                        <button className="action-icon-button">
                                            <span>View</span>
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SellerDashboardTicketsPage 