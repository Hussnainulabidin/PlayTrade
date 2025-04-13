"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import { Search, ExternalLink, MoreVertical } from "lucide-react"
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
  const params = useParams()
  const sellerId = propSellerId || params.id
  const dropdownRef = useRef(null)

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
        
        const response = await axios.get(
          `http://localhost:3003/orders/seller/${sellerId}`,
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
  }, [sellerId])

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
        <Link to={`/admindashboard/sellers/${sellerId}`} className="back-button">
          Back to Seller
        </Link>
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
                  <td className="table-cell order-id">#{order.id}</td>
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
                    <button className="action-icon-button">
                      <ExternalLink className="action-icon" size={18} />
                    </button>
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
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          <div className="dropdown-menu">
            <button className="dropdown-item">View Order Details</button>
            <button className="dropdown-item">Update Status</button>
            <button className="dropdown-item dropdown-item-danger">Refund Order</button>
          </div>
        </div>
      )}
    </div>
  )
}

SellerOrders.propTypes = {
  sellerId: PropTypes.string
}
