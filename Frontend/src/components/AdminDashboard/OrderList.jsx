"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Search, ExternalLink, MoreVertical, Plus } from "lucide-react"
import axios from "axios"
import "./SellerListing.css"

export function OrdersList() {
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  const handleDropdownClick = (orderId, event) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom,
      left: rect.left - 120 // Position to the left of the button
    })
    setActiveDropdownId(activeDropdownId === orderId ? null : orderId)
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
        
        const response = await axios.get(
          "http://localhost:3003/orders",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined
            }
          }
        )
        
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
        <div className="header-buttons">
          <button className="header-button">Account Imports</button>
          <button className="add-new-button">
            <Plus className="mr-2" size={16} />
            Add New Order
          </button>
        </div>
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
              <th className="table-header">CUSTOMER</th>
              <th className="table-header">SELLER</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">AMOUNT</th>
              <th className="table-header">DATE</th>
              <th className="table-header">ACTIONS</th>
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
                  <td className="table-cell listing-id">#{order.id}</td>
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
                        ? "badge-listed"
                        : order.status === "Processing"
                          ? "badge-other"
                          : "badge-draft"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">{order.amount}</td>
                  <td className="table-cell">{order.date}</td>
                  <td className="actions-cell">
                    <button className="action-button">
                      <ExternalLink size={14} />
                    </button>
                    <button 
                      className="action-button"
                      onClick={(e) => handleDropdownClick(order.id, e)}
                    >
                      <MoreVertical size={14} />
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
