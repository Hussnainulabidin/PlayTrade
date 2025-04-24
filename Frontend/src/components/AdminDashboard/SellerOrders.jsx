"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useParams, useLocation, useNavigate } from "react-router-dom"
import { Search, ExternalLink, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import PropTypes from "prop-types"
import axios from "axios"
import "./SellerOrders.css"

export function SellerOrders({ sellerId: propSellerId }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [refunding, setRefunding] = useState(false)
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const sellerId = propSellerId || params.id
  const dropdownRef = useRef(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0
  })

  // Get the current page from URL params or default to 1
  const getPageFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return parseInt(searchParams.get('page')) || 1;
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        
        // Get the auth token (try different storage methods)
        let token = localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || localStorage.getItem('token')
        
        // Remove quotes if they exist
        if (token && token.startsWith('"') && token.endsWith('"')) {
          token = token.slice(1, -1)
        }
        
        const currentPage = getPageFromUrl();
        
        const response = await axios.get(
          `http://localhost:3003/orders/seller/${sellerId}?page=${currentPage}&limit=12`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined
            }
          }
        )
        
        if (response.data.status === 'success') {
          setOrders(response.data.data)
          setPagination({
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 1,
            totalOrders: response.data.totalOrders || 0
          })
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
  }, [sellerId, location.search])

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

  const handleDropdownClick = (orderId, event) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom,
      left: rect.left - 120 // Position to the left of the button
    })
    setActiveDropdownId(activeDropdownId === orderId ? null : orderId)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    navigate(`/admindashboard/sellers/${sellerId}/orders?page=${newPage}`);
  }

  const handleRefundOrder = async (orderId) => {
    // Ask for confirmation before proceeding
    if (!window.confirm('Are you sure you want to refund this order? This will:\n- Return the full payment to the customer\n- Deduct funds from the seller\'s wallet\n- Set the account status back to active\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      setRefunding(true);
      // Get auth token
      let token = localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || localStorage.getItem('token');
      
      // Remove quotes if they exist
      if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
      
      const response = await axios.post(
        `http://localhost:3003/orders/${orderId}/refund`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the order status in the UI
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId
              ? { ...order, status: 'Refunded' }
              : order
          )
        );
        
        // Show success message
        alert('Order has been successfully refunded.');
        
        // Close dropdown
        setActiveDropdownId(null);
      }
    } catch (err) {
      console.error('Error refunding order:', err);
      alert(`Failed to refund order: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setRefunding(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.includes(searchQuery) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerId.includes(searchQuery) ||
      (order.gameType && order.gameType.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading order data...</div>
      </div>
    )
  }

  if (error) {
    return <div className="error-state">{error}</div>
  }

  return (
    <div className="orders-container">
      <div className="listings-header">
        <h1 className="listings-title">Orders for Seller: {sellerId}</h1>
        <Link 
          to={`/admindashboard/sellers/${sellerId}`} 
          className="back-button"
        >
          Back to Seller
        </Link>
      </div>
      <div className="orders-toolbar">
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

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">ORDER ID</th>
              <th className="table-header">CUSTOMER ID</th>
              <th className="table-header">GAME TYPE</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">AMOUNT</th>
              <th className="table-header">DATE</th>
              <th className="table-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-orders-message">
                  This seller has no orders yet.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="table-row">
                  <td className="table-cell order-id">
                    <Link to={`/order/${order.id}`} className="order-link">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="table-cell">{order.customerId}</td>
                  <td className="table-cell">{order.gameType}</td>
                  <td className="table-cell">
                    <span className={`status-badge ${
                      order.status === "Completed"
                        ? "badge-completed"
                        : order.status === "Processing"
                          ? "badge-processing"
                          : "badge-refunded"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">{order.amount}</td>
                  <td className="table-cell">{order.date}</td>
                  <td className="table-cell actions-cell">
                    <Link to={`/order/${order.id}`}>
                      <button className="action-icon-button">
                        <ExternalLink className="action-icon" size={18} />
                      </button>
                    </Link>
                    <button 
                      className="action-icon-button"
                      onClick={(e) => handleDropdownClick(order.id, e)}
                    >
                      <MoreVertical className="action-icon" size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button 
            className="pagination-button"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {activeDropdownId && (
        <div
          ref={dropdownRef}
          className="dropdown-container"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          <div className="dropdown-menu">
            <button className="dropdown-item dropdown-item-danger"
              onClick={() => handleRefundOrder(activeDropdownId)}
              disabled={refunding}
            >
              {refunding ? "Processing..." : "Refund Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

SellerOrders.propTypes = {
  sellerId: PropTypes.string
}
