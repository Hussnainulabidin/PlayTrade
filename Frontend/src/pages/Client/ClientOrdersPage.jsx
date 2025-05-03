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
    if (!status) return 'badge-draft';

    // Convert status to lowercase for consistent matching
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case 'processing':
        return 'badge-draft';
      case 'completed':
        return 'badge-listed';
      case 'refunded':
      case 'cancelled':
        return 'badge-sold';
      case 'disputed':
        return 'badge-other';
      default:
        return 'badge-draft';
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
    <div className="listings-container">
      <div className="listings-header">
        <h1 className="listings-title">My Orders</h1>
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
              <th className="table-header"></th>
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
                  <td className="table-cell order-id">
                    <Link to={`/order/${order.id}`} className="order-link">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="table-cell">{order.gameType}</td>
                  <td className="table-cell">{order.title}</td>
                  <td className="table-cell">
                    <div className="seller-display">
                      <div className="seller-avatar">
                        {order.seller?.username?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <span className="seller-name">{order.seller?.username || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">${typeof order.amount === 'number' ? order.amount.toFixed(2) : order.amount}</td>
                  <td className="table-cell">{formatDate(order.createdAt)}</td>
                  <td className="table-cell actions-cell">
                    <Link to={`/order/${order.id}`} className="action-icon-button">
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
  )
}

export default ClientOrdersPage 