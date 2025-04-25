import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, ExternalLink } from "lucide-react"
import axios from "axios"
import { useUser } from "../components/userContext/UserContext"
import "./pages.css"
import "../components/AdminDashboard/ui.css"

function ClientOrdersPage() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useUser() // Kept for potential future use and authentication context
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        
        // Get the auth token
        let token = localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || localStorage.getItem('token')
        
        // Remove quotes if they exist
        if (token && token.startsWith('"') && token.endsWith('"')) {
          token = token.slice(1, -1)
        }
        
        const response = await axios.get(
          "http://localhost:3003/orders/my-orders",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined
            }
          }
        )
        
        if (response.data.status === 'success') {
          setOrders(response.data.data)
        } else {
          throw new Error('Failed to fetch orders')
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err.response?.data?.message || 'Failed to load orders data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(
    (order) =>
      order.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Processing': 'status-processing',
      'Completed': 'status-completed',
      'Refunded': 'status-refunded',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-processing';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return <div className="error-state">{error}</div>
  }

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1 className="listings-title">My Orders</h1>
      </div>

      <div className="listings-toolbar">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="listings-table">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">ORDER ID</th>
              <th className="table-header">GAME TYPE</th>
              <th className="table-header">TITLE</th>
              <th className="table-header">SELLER</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">AMOUNT</th>
              <th className="table-header">DATE</th>
              <th className="table-header" style={{ textAlign: "center", width: "80px" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-orders-message">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="table-row">
                  <td className="table-cell">#{order.id}</td>
                  <td className="table-cell">{order.gameType}</td>
                  <td className="table-cell title-cell">{order.title}</td>
                  <td className="table-cell">
                    <div className="user-cell">
                      <div className="user-avatar" style={{ backgroundColor: "#7c3aed" }}>
                        {order.seller?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span>{order.seller?.username}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">${order.amount.toFixed(2)}</td>
                  <td className="table-cell">{formatDate(order.createdAt)}</td>
                  <td className="table-cell actions-cell" style={{ textAlign: "center" }}>
                    <Link 
                      to={`/order/${order.id}`} 
                      className="action-icon-link" 
                      style={{ 
                        color: "#7c3aed", 
                        display: "inline-flex",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        alignItems: "center",
                        transition: "all 0.2s ease",
                        background: "transparent",
                        margin: "0 auto"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "rgba(124, 58, 237, 0.1)";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      title="View Order Details"
                    >
                      <ExternalLink size={22} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClientOrdersPage 