import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, ExternalLink } from "lucide-react"
import { orderApi } from "../../api"
import { useUser } from "../../components/userContext/UserContext"
import "../pages.css"
import "../../components/AdminDashboard/common/Common.css"
import "../../components/AdminDashboard/common/TableStyles.css"
import "./ClientOrdersPage.css" // Import custom CSS

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

        const response = await orderApi.getMyOrders();

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
    if (!status) return 'status-processing';

    // Convert status to lowercase for consistent matching
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'refunded':
      case 'cancelled':
        return 'status-refunded';
      case 'disputed':
        return 'status-disputed';
      default:
        return 'status-processing';
    }
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
    <div className="orders-page-container">
      <div className="orders-header">
        <div className="orders-title-section">
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">View and manage all your account purchases</p>
        </div>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, title, game type or seller..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th className="order-table-header order-id-column">ORDER ID</th>
              <th className="order-table-header game-type-column">GAME TYPE</th>
              <th className="order-table-header">TITLE</th>
              <th className="order-table-header">SELLER</th>
              <th className="order-table-header">STATUS</th>
              <th className="order-table-header">AMOUNT</th>
              <th className="order-table-header">DATE</th>
              <th className="order-table-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-orders-message">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="order-table-row">
                  <td className="order-table-cell order-id order-id-column">
                    <Link to={`/order/${order.id}`} className="order-link">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="order-table-cell game-type-column">{order.gameType}</td>
                  <td className="order-table-cell">{order.title}</td>
                  <td className="order-table-cell">
                    <div className="seller-display">
                      <div className="seller-avatar">
                        {order.seller?.username?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <span className="seller-name">{order.seller?.username || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="order-table-cell">
                    <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="order-table-cell">${typeof order.amount === 'number' ? order.amount.toFixed(2) : order.amount}</td>
                  <td className="order-table-cell">{formatDate(order.createdAt)}</td>
                  <td className="order-table-cell actions-cell">
                    <Link to={`/order/${order.id}`} className="order-action-link">
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
  )
}

export default ClientOrdersPage 