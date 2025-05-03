import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { PlusCircle, TicketIcon, ExternalLink } from "lucide-react";
import { ticketApi } from "../../api";
import { useUser } from "../../components/userContext/UserContext";
import "../pages.css";
import "../../components/AdminDashboard/common/Common.css";
import "../../components/AdminDashboard/common/TableStyles.css";
import "./ClientTicketsPage.css";

function ClientTicketsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusClass = (status) => {
    if (!status) return "badge-draft";

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "open":
        return "badge-listed";
      case "in progress":
        return "badge-draft";
      case "closed":
        return "badge-sold";
      default:
        return "badge-other";
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
    <div className="listings-container">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <div className="listings-header">
        <h1 className="listings-title">My Support Tickets</h1>
        <button
          className="add-new-button"
          onClick={handleCreateTicket}
        >
          <PlusCircle size={18} />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="listings-table">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">TICKET ID</th>
              <th className="table-header">TYPE</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">CREATED</th>
              <th className="table-header">LAST ACTIVITY</th>
              <th className="table-header"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-listings-message">
                  You haven't created any support tickets yet.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket._id} className="table-row">
                  <td className="table-cell">
                    <div className="ticket-id-wrapper">
                      <TicketIcon size={16} className="ticket-icon" />
                      <span>#{ticket._id.slice(-6)}</span>
                    </div>
                  </td>
                  <td className="table-cell">{ticket.ticketType}</td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="table-cell">{formatDate(ticket.createdAt)}</td>
                  <td className="table-cell">{formatDate(ticket.lastActivity)}</td>
                  <td className="table-cell actions-cell">
                    <Link to={`/tickets/${ticket._id}`} className="action-icon-button">
                      <ExternalLink className="action-icon" size={18} />
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