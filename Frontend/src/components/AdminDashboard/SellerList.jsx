"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Search, MoreVertical, Plus, Edit } from "lucide-react"
import { Input } from "./ui/input"
import axios from "axios"
import "./common/Common.css"
import "./common/TableStyles.css"
import { formatDate } from "../../lib/utils"

export function SellersList() {
  const [sellers, setSellers] = useState([])
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

  const handleDropdownClick = (sellerId, event) => {
    event.stopPropagation()
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    // Calculate position relative to viewport
    const left = rect.left - 120 // Position dropdown to the left of the button
    
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: Math.max(10, left) // Ensure dropdown doesn't go off-screen to the left
    })
    
    setActiveDropdownId(activeDropdownId === sellerId ? null : sellerId)
  }

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3003/users/getSeller");
        console.log(response.data.data)
        setSellers(response.data.data)
      } catch (err) {
        console.error("Error fetching sellers:", err);
        setError("Failed to fetch sellers. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchSellers();
  }, [])

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.id?.includes(searchQuery) ||
      seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading sellers...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1 className="listings-title">Sellers</h1>
        <div className="header-buttons">
          <button className="add-new-button">
            <Plus size={18} />
            Add New Seller
          </button>
        </div>
      </div>

      <div className="orders-toolbar">
        <div className="search-container">
          <Search className="search-icon" />
          <Input
            placeholder="Search sellers..."
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
              <th className="table-header">SELLER ID</th>
              <th className="table-header">NAME</th>
              <th className="table-header">EMAIL</th>
              <th className="table-header">STATUS</th>
              <th className="table-header">TOTAL ORDERS</th>
              <th className="table-header">TOTAL LISTINGS</th>
              <th className="table-header">WALLET BALANCE</th>
              <th className="table-header">JOIN DATE</th>
              <th className="table-header"></th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.map((seller) => (
              <tr key={seller.id} className="table-row">
                <td className="table-cell listing-id">
                  <Link to={`/admindashboard/sellers/${seller.id}`} className="seller-link">
                    #{seller.id}
                  </Link>
                </td>
                <td className="table-cell">{seller.name ? (seller.name.length > 50 ? seller.name.substring(0, 50) + '...' : seller.name) : ''}</td>
                <td className="table-cell">{seller.email ? (seller.email.length > 50 ? seller.email.substring(0, 50) + '...' : seller.email) : ''}</td>
                <td className="table-cell">
                  <span className={`status-badge ${
                    seller.status === "Active"
                      ? "badge-listed"
                      : seller.status === "Suspended"
                      ? "badge-draft"
                      : "badge-other"
                  }`}>
                    {seller.status}
                  </span>
                </td>
                <td className="table-cell">{seller.totalOrders}</td>
                <td className="table-cell">{seller.totalListings}</td>
                <td className="table-cell">€{seller.wallet}</td>
                <td className="table-cell">{formatDate(seller.joinDate)}</td>
                <td className="table-cell actions-cell">
                  <button className="action-icon-button">
                    <Edit className="action-icon" size={18} />
                  </button>
                  <button 
                    className="action-icon-button"
                    onClick={(e) => handleDropdownClick(seller.id, e)}
                  >
                    <MoreVertical className="action-icon" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeDropdownId && (
        <div
          ref={dropdownRef}
          className="dropdown-container"
          style={{
            position: 'fixed', // Change to fixed positioning
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="dropdown-menu">
            <Link
              to={`/admindashboard/sellers/${activeDropdownId}/orders`}
              className="dropdown-item"
            >
              View Orders
            </Link>
            <Link
              to={`/admindashboard/sellers/${activeDropdownId}/listings`}
              className="dropdown-item"
            >
              View Listings
            </Link>
            <Link
              to={`/admindashboard/sellers/${activeDropdownId}/wallet`}
              className="dropdown-item"
            >
              Manage Wallet
            </Link>
            <button className="dropdown-item dropdown-item-danger">
              Suspend Seller
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
