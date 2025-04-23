"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useParams, useLocation, useNavigate } from "react-router-dom"
import { Search, MoreVertical, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import "./SellerListing.css"
import { formatDate } from "../../lib/utils"

export function SellerListings() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAccounts: 0
  })
  const dropdownRef = useRef(null)

  // Get the current page from URL params or default to 1
  const getPageFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return parseInt(searchParams.get('page')) || 1;
  }

  useEffect(() => {
    const fetchSellerAccounts = async () => {
      try {
        setLoading(true)
        // Get the auth token (try different storage methods)
        let token = localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || localStorage.getItem('token')
        
        // Remove quotes if they exist
        if (token && token.startsWith('"') && token.endsWith('"')) {
          token = token.slice(1, -1)
        }
        
        console.log('Using token:', token ? 'Token exists' : 'No token found')
        
        const currentPage = getPageFromUrl();
        
        // Make API request with proper error handling
        try {
          const response = await axios.get(
            `http://localhost:3003/gameAccounts/seller/${id}?page=${currentPage}&limit=12`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined
              }
            }
          )
          
          console.log('API Response:', response.data)
          
          if (response.data.status === 'success') {
            const accountsData = response.data.data.gameAccounts.map(account => ({
              id: account._id,
              title: account.title,
              game: account.gameType || "Valorant",
              status: account.status,
              price: `€${account.price}`,
              views: 0,
              createdDate: account.createdAt,
            }))
            
            setListings(accountsData)
            setPagination({
              currentPage: response.data.currentPage || 1,
              totalPages: response.data.totalPages || 1,
              totalAccounts: response.data.totalAccounts || 0
            })
          }
        } catch (apiError) {
          console.error("API Error Details:", apiError.response ? apiError.response.data : apiError.message)
        }
      } catch (err) {
        console.error("Error in fetch operation:", err)
        setError("Something went wrong while loading listings.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSellerAccounts()
  }, [id, location.search])

  const filteredListings = listings.filter(
    (listing) =>
      listing.id.includes(searchQuery) ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.game.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const handleDropdownClick = (listingId, event) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom,
      left: rect.left - 120 // Position to the left of the button
    })
    setActiveDropdownId(activeDropdownId === listingId ? null : listingId)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    navigate(`/admindashboard/sellers/${id}/listings?page=${newPage}`);
  }

  if (loading) return (
    <div className="loading-state">
      <div className="loader-spinner"></div>
      <div className="loader-text">Loading seller listings...</div>
    </div>
  )
  if (error) return <div className="error-state">{error}</div>

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1 className="listings-title">Listings for Seller: {id}</h1>
        <Link 
          to={`/admindashboard/sellers/${id}`} 
          className="back-button"
        >
          Back to Seller
        </Link>
      </div>

      <div className="listings-toolbar">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search listings..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="no-listings-message">
          This seller has no listings yet.
        </div>
      ) : (
        <>
          <div className="listings-table">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">LISTING ID</th>
                  <th className="table-header">TITLE</th>
                  <th className="table-header">GAME</th>
                  <th className="table-header">STATUS</th>
                  <th className="table-header">PRICE</th>
                  <th className="table-header">CREATED DATE</th>
                  <th className="table-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="table-row">
                    <td className="table-cell listing-id">
                      <Link to={`/admindashboard/sellers/${id}/listings/${listing.id}`} className="seller-link">
                        #{listing.id}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <Link to={`/admindashboard/sellers/${id}/listings/${listing.id}`} className="seller-link">
                        {listing.title ? (listing.title.length > 50 ? listing.title.substring(0, 50) + '...' : listing.title) : ''}
                      </Link>
                    </td>
                    <td className="table-cell">{listing.game}</td>
                    <td className="table-cell">
                      <span className={`status-badge ${
                        listing.status === "active"
                          ? "badge-listed"
                          : listing.status === "draft"
                            ? "badge-draft"
                            : listing.status === "sold"
                              ? "badge-sold"
                              : "badge-other"
                      }`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </td>
                    <td className="table-cell">{listing.price}</td>
                    <td className="table-cell">{formatDate(listing.createdDate)}</td>
                    <td className="table-cell actions-cell">
                      <button className="action-icon-button">
                        <Edit className="action-icon" size={18} />
                      </button>
                      <button 
                        className="action-icon-button"
                        onClick={(e) => handleDropdownClick(listing.id, e)}
                      >
                        <MoreVertical className="action-icon" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
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
        </>
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
            <button className="dropdown-item">View Listing</button>
            <button className="dropdown-item">Edit Listing</button>
            {listings.find(listing => listing.id === activeDropdownId)?.status === "active" ? (
              <button className="dropdown-item">Set to Draft</button>
            ) : (
              <button className="dropdown-item">Publish Listing</button>
            )}
            <button className="dropdown-item dropdown-item-danger">
              Delete Listing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
