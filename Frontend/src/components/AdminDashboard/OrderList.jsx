"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Search, ExternalLink, MoreVertical, Plus } from "lucide-react"
import { orderApi } from "../../api"
import "./common/Common.css"
import "./common/TableStyles.css"

export function OrdersList() {
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [refunding, setRefunding] = useState(false)
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        
        const response = await orderApi.getAllOrders()
        
        console.log("Orders response:", response.data)
        
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

  const handleRefundOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to refund this order? This will:\n- Return the full payment to the customer\n- Deduct funds from the seller\'s wallet\n- Set the account status back to active\n- Record transactions in wallet history\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      setRefunding(true);
      
      const response = await orderApi.refundOrder(orderId);
      
      if (response.data.status === 'success') {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId
              ? { ...order, status: 'Refunded' }
              : order
          )
        );
        
        alert('Order has been successfully refunded. Wallet transactions have been recorded.');
        
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
      order.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.seller?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="listings-title">Orders</h1>
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

      <div className="listings-table">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">ORDER ID</th>
              <th className="table-header">GAME TYPE</th>
              <th className="table-header">CUSTOMER</th>
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
                <td colSpan="9" className="no-orders-message">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="table-row">
                    <td className="table-cell listing-id">
                    <Link to={`/order/${order.id}`} className="seller-link">
                    {order.id}
                    </Link>
                  </td>
                  <td className="table-cell">{order.gameType}</td>
                  <td className="table-cell">
                    <Link to={`/admindashboard/customers/${order.customer?.id}`} className="seller-link">
                      {order.customer?.username}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <Link to={`/admindashboard/sellers/${order.seller?.id}`} className="seller-link">
                      {order.seller?.username}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${
                      order.status === "Completed"
                        ? "badge-completed"
                        : order.status === "Processing"
                          ? "badge-processing"
                          : order.status === "Refunded"
                            ? "badge-refunded"
                            : "badge-other"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">{order.amount}</td>
                  <td className="table-cell">{order.date}</td>
                  <td className="table-cell actions-cell">
                    <Link to={`/order/${order.id}`} className="action-icon-button">
                      <ExternalLink className="action-icon" size={18} />
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
            <Link to={`/order/${activeDropdownId}`} className="dropdown-item">View Order Details</Link>
            <button 
              className="dropdown-item dropdown-item-danger"
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