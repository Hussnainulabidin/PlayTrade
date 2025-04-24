"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Search, Plus, MoreVertical, Edit, UserPlus, XCircle } from "lucide-react"
import { Input } from "../components/AdminDashboard/ui/input"
import axios from "axios"
import "./tickets.css"

function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:3003/tickets?filter=${activeFilter}`)
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

  const handleJoinTicket = async (ticketId) => {
    try {
      await axios.post(`http://localhost:3003/tickets/${ticketId}/join`)
      // Refresh tickets after joining
      const response = await axios.get(`http://localhost:3003/tickets?filter=${activeFilter}`)
      setTickets(response.data.data.tickets)
      // Navigate to the ticket page after joining
      window.location.href = `/tickets/${ticketId}`;
    } catch (err) {
      console.error("Error joining ticket:", err)
      alert("Failed to join ticket. Please try again.")
    }
  }

  const handleCloseTicket = async (ticketId) => {
    try {
      // Ask for confirmation before closing
      if (!window.confirm("Are you sure you want to close this ticket?")) {
        return;
      }
      
      // Call the API to update ticket status to "Closed"
      await axios.patch(`http://localhost:3003/tickets/${ticketId}/status`, {
        status: "Closed"
      });
      
      // Update the local state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId 
            ? { ...ticket, status: "Closed" } 
            : ticket
        )
      );
      
      // Close the dropdown
      setActiveDropdownId(null);
      
      // Display success message
      alert("Ticket closed successfully");
    } catch (err) {
      console.error("Error closing ticket:", err);
      alert("Failed to close ticket. Please try again.");
    }
  };

  const handleDropdownClick = (ticketId, event) => {
    event.stopPropagation()
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    // Calculate position relative to viewport
    const left = rect.left - 120 // Position dropdown to the left of the button
    
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: Math.max(10, left) // Ensure dropdown doesn't go off-screen to the left
    })
    
    setActiveDropdownId(activeDropdownId === ticketId ? null : ticketId)
  }

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
          <Link to="/dashboard/tickets/new">
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
          className={`filter-button ${activeFilter === 'mytickets' ? 'active' : ''}`}
          onClick={() => setActiveFilter('mytickets')}
        >
          My Tickets
        </button>
        <button
          className={`filter-button ${activeFilter === 'unattended' ? 'active' : ''}`}
          onClick={() => setActiveFilter('unattended')}
        >
          Unattended
        </button>
      </div>

      <div className="listings-table">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">TICKET ID</th>
              <th className="table-header">TYPE</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">SELLER</th>
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
                  {ticket.assignedAdmin ? (
                    <Link to={`/tickets/${ticket._id}`} className="seller-link">
                      #{ticket._id.slice(-6)}
                    </Link>
                  ) : (
                    <Link to={`/tickets/${ticket._id}`} className="unassigned-ticket-id">
                      #{ticket._id.slice(-6)}
                    </Link>
                  )}
                </td>
                <td className="table-cell">
                  <span className={`status-badge ${ticket.ticketType === "Marketplace Issue"
                      ? "badge-purple"
                      : ticket.ticketType === "Order Issue"
                      ? "badge-blue"
                      : ticket.ticketType === "Client Ticket"
                      ? "badge-green"
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
                      : ticket.status === "Closed"
                      ? "badge-refunded"
                      : "badge-other"
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="seller-info">
                    <span className="seller-name">{ticket.sellerId?.username || "N/A"}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="admin-info">
                    <span className="admin-name">{ticket.assignedAdmin?.username || "N/A"}</span>
                  </div>
                </td>
                <td className="table-cell">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td className="table-cell">{new Date(ticket.lastActivity).toLocaleDateString()}</td>
                <td className="table-cell actions-cell">
                  {!ticket.assignedAdmin && (
                    <button
                      className="action-icon-button join-button"
                      onClick={() => handleJoinTicket(ticket._id)}
                      title="Join Ticket"
                    >
                      <UserPlus className="action-icon" size={18} />
                    </button>
                  )}
                  
                  <Link to={`/tickets/${ticket._id}`}>
                    <button 
                      className="action-icon-button"
                      title="View Ticket"
                    >
                      <Edit className="action-icon" size={18} />
                    </button>
                  </Link>
                  
                  <button 
                    className="action-icon-button"
                    onClick={(e) => handleDropdownClick(ticket._id, e)}
                    title="More Options"
                  >
                    <MoreVertical className="action-icon" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeDropdownId && (
        <div
          ref={dropdownRef}
          className="dropdown-container"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="dropdown-menu">
            <button 
              className="dropdown-item dropdown-item-danger"
              onClick={() => handleCloseTicket(activeDropdownId)}
              disabled={tickets.find(t => t._id === activeDropdownId)?.status === "Closed"}
            >
              <XCircle size={14} className="dropdown-icon" />
              Close Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketsPage
