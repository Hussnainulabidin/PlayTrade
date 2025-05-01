import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Search, PlusCircle, TicketIcon, ExternalLink } from "lucide-react";
import { ticketApi } from "../../api";
import { useUser } from "../../components/userContext/UserContext";
import "../pages.css";
import "./ClientTicketsPage.css";

function ClientTicketsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message);
      
      // Clean up the location state
      window.history.replaceState({}, document.title);
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Fetch client tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        
        const response = await ticketApi.getClientTickets(user._id);
        
        if (response.data.status === "success") {
          setTickets(response.data.data.tickets);
        } else {
          throw new Error("Failed to fetch tickets");
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(
          err.response?.data?.message || "Failed to load tickets data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchTickets();
    }
  }, [user]);

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket._id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusClass = (status) => {
    if (!status) return "status-open";

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "open":
        return "status-open";
      case "in progress":
        return "status-in-progress";
      case "closed":
        return "status-closed";
      default:
        return "status-open";
    }
  };

  const handleCreateTicket = () => {
    navigate("/client/support");
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="tickets-page-container">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="tickets-header">
        <div className="tickets-title-section">
          <h1 className="tickets-title">My Support Tickets</h1>
          <p className="tickets-subtitle">View and manage your support requests</p>
        </div>
        <div className="tickets-actions">
          <div className="search-container">

          </div>
          <button
            className="create-ticket-button"
            onClick={handleCreateTicket}
          >
            <PlusCircle size={18} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th className="ticket-table-header">TICKET ID</th>
              <th className="ticket-table-header">TYPE</th>
              <th className="ticket-table-header">STATUS</th>
              <th className="ticket-table-header">CREATED</th>
              <th className="ticket-table-header">LAST ACTIVITY</th>
              <th className="ticket-table-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-tickets-message">
                  {searchQuery ? "No tickets found matching your search." : "You haven't created any support tickets yet."}
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="ticket-table-row">
                  <td className="ticket-table-cell ticket-id">
                    <div className="ticket-id-wrapper">
                      <TicketIcon size={16} className="ticket-icon" />
                      <span>#{ticket._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="ticket-table-cell">{ticket.ticketType}</td>
                  <td className="ticket-table-cell">
                    <span className={`ticket-status-badge ${getStatusClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="ticket-table-cell">{formatDate(ticket.createdAt)}</td>
                  <td className="ticket-table-cell">{formatDate(ticket.lastActivity)}</td>
                  <td className="ticket-table-cell actions-cell">
                    <Link to={`/tickets/${ticket._id}`} className="ticket-action-link">
                      <ExternalLink size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientTicketsPage; 