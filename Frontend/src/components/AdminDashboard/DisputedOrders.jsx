"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Search, ExternalLink, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { orderApi } from "../../api"
import "./common/Common.css"
import "./common/TableStyles.css"

export function DisputedOrders() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [processing, setProcessing] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
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
    const fetchDisputedOrders = async () => {
      try {
        setLoading(true)
        const currentPage = getPageFromUrl();
        
        // Using the API module for disputed orders
        const response = await orderApi.getDisputedOrders(currentPage, 12);
        
        if (response.data.status === 'success') {
          console.log('Disputed orders response:', response.data);
          setOrders(response.data.data)
          setPagination({
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 1,
            totalOrders: response.data.totalOrders || 0
          })
        } else {
          throw new Error('Failed to fetch disputed orders')
        }
      } catch (err) {
        console.error('Error fetching disputed orders:', err)
        setError(err.response?.data?.message || 'Failed to load disputed orders data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDisputedOrders()
  }, [location.search])

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
    event.stopPropagation()
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    // Calculate position relative to viewport
    const left = rect.left - 120 // Position dropdown to the left of the button
    
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: Math.max(10, left) // Ensure dropdown doesn't go off-screen to the left
    })
    
    setActiveDropdownId(activeDropdownId === orderId ? null : orderId)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    navigate(`/admin/disputed-orders?page=${newPage}`);
  }

  const handleResolveDispute = async (orderId, resolution) => {
    // Ask for confirmation before proceeding
    if (!window.confirm(`Are you sure you want to ${resolution} this dispute? This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessing(true);
      
      // Using the API module for resolving disputes
      const response = await orderApi.resolveDispute(orderId, resolution);
      
      if (response.data.status === 'success') {
        // Update the order status in the UI
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId
              ? { ...order, status: resolution === 'refund' ? 'Refunded' : 'Completed' }
              : order
          )
        );
        
        // Show success message
        alert(`Dispute has been ${resolution === 'refund' ? 'refunded to customer' : 'resolved in favor of seller'}.`);
        
        // Close dropdown
        setActiveDropdownId(null);
      }
    } catch (err) {
      console.error('Error resolving dispute:', err);
      alert(`Failed to resolve dispute: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id?.toString().includes(searchQuery) ||
      (order.customer && order.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.seller && order.seller.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerId && order.customerId.toString().includes(searchQuery)) ||
      (order.sellerId && order.sellerId.toString().includes(searchQuery)) ||
      (order.gameType && order.gameType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.disputeReason && order.disputeReason.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading disputed orders...</div>
      </div>
    )
  }

  if (error) {
    return <div className="error-state">{error}</div>
  }

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1 className="listings-title">Disputed Orders</h1>
      </div>
      <div className="orders-toolbar">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search disputed orders..."
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
              <th className="table-header">CUSTOMER</th>
              <th className="table-header">SELLER</th>
              <th className="table-header">GAME TYPE</th>
              <th className="table-header">AMOUNT</th>
              <th className="table-header">DISPUTE REASON</th>
              <th className="table-header">DATE</th>
              <th className="table-header"></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-orders-message">
                  No disputed orders found.
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
                  <td 
                    className="table-cell" 
                  >
                    {order.customer || 'Unknown Customer'}
                  </td>
                  <td 
                    className="table-cell"
                  >
                    {order.seller || 'Unknown Seller'}
                  </td>
                  <td className="table-cell">{order.gameType || 'Unknown'}</td>
                  <td className="table-cell">{order.amount || '$0.00'}</td>
                  <td 
                    className="table-cell dispute-reason" 
                    title={order.disputeReason || 'No reason provided'}
                  >
                    {order.disputeReason || 'No reason provided'}
                  </td>
                  <td className="table-cell">{order.date || 'Unknown Date'}</td>
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
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="dropdown-menu">
            <button 
              className="dropdown-item dropdown-item-success"
              onClick={() => handleResolveDispute(activeDropdownId, 'approve')}
              disabled={processing}
            >
              {processing ? "Processing..." : "Resolve for Seller"}
            </button>
            <button 
              className="dropdown-item dropdown-item-danger"
              onClick={() => handleResolveDispute(activeDropdownId, 'refund')}
              disabled={processing}
            >
              {processing ? "Processing..." : "Refund to Customer"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 