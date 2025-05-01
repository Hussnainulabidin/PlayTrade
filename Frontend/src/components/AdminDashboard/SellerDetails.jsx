import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { User, Mail, Calendar, Package, ShoppingCart, Wallet } from "lucide-react"
import "./SellerDetails.css"
import { userApi } from "../../api"
import { formatDate } from "../../lib/utils"

export function SellerDetails() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const response = await userApi.getSellerById(id)
        setSeller(response.data.data)
      } catch (err) {
        setError("Failed to fetch seller details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSellerDetails()
  }, [id])

  if (loading) return (
    <div className="loading-state">
      <div className="loader-spinner"></div>
      <div className="loader-text">Loading seller details...</div>
    </div>
  )
  if (error) return <div className="error-state">{error}</div>
  if (!seller) return <div className="error-state">Seller not found</div>

  return (
    <div className="seller-dashboard">
      <div className="grid-container">
        {/* Seller Information Card */}
        <div className="card">
          <h2 className="card-title">Seller Information</h2>
          <p className="card-subtitle">Basic details about the seller</p>
          
          <div className="info-list">
            <div className="info-item">
              <User className="info-icon" />
              <div className="info-content">
                <p className="info-label">Name</p>
                <p className="info-value">{seller.name}</p>
              </div>
            </div>

            <div className="info-item">
              <Mail className="info-icon" />
              <div className="info-content">
                <p className="info-label">Email</p>
                <p className="info-value">{seller.email}</p>
              </div>
            </div>

            <div className="info-item">
              <Calendar className="info-icon" />
              <div className="info-content">
                <p className="info-label">Join Date</p>
                <p className="info-value">{formatDate(seller.joinDate)}</p>
              </div>
            </div>

            <div>
              <span className={`status-badge ${
                seller.status === "Active" 
                  ? "status-active"
                  : seller.status === "Suspended"
                  ? "status-suspended"
                  : "status-inactive"
              }`}>
                {seller.status}
              </span>
            </div>
          </div>
        </div>

        {/* Orders & Listings Card */}
        <div className="card">
          <h2 className="card-title">Orders & Listings</h2>
          <p className="card-subtitle">Summary of seller activity</p>

          <div className="info-list">
            <div className="info-item">
              <ShoppingCart className="info-icon" />
              <div className="info-content">
                <p className="info-label">Total Orders</p>
                <p className="info-value info-value-large">{seller.totalOrders}</p>
              </div>
            </div>

            <div className="info-item">
              <Package className="info-icon" />
              <div className="info-content">
                <p className="info-label">Total Listings</p>
                <p className="info-value info-value-large">{seller.totalListings}</p>
              </div>
            </div>

            <div className="button-group">
              <Link to={`/admindashboard/sellers/${id}/orders`} className="button-link">
                <button className="view-button">View Orders</button>
              </Link>
              <Link to={`/admindashboard/sellers/${id}/listings`} className="button-link">
                <button className="view-button">View Listings</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="card">
          <h2 className="card-title">Wallet</h2>
          <p className="card-subtitle">Seller&apos;s financial information</p>

          <div className="info-list">
            <div className="info-item">
              <Wallet className="info-icon" />
              <div className="info-content">
                <p className="info-label">Balance</p>
                <p className="info-value info-value-large">€ {seller.walletBalance}</p>
              </div>
            </div>

            <Link to={`/admindashboard/sellers/${id}/wallet`} className="button-link">
              <button className="purple-button">Manage Wallet</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="tabs-container">
        <div className="tabs-header">
          <nav className="tabs-nav">
            <button className="tab-button active">Recent Activity</button>
            <button className="tab-button">Orders</button>
            <button className="tab-button">Listings</button>
          </nav>
        </div>

        {/* Activity List */}
        <div className="activity-list">
          {seller.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-info">
                {activity.type === 'Order' ? (
                  <ShoppingCart className="info-icon" />
                ) : (
                  <Wallet className="info-icon" />
                )}
                <div className="activity-details">
                  <p className="activity-title">{activity.type} : {activity.id}</p>
                  <p className="activity-subtitle">€{activity.amount}</p>
                </div>
              </div>
              <div className="activity-meta">
                <span className="activity-date">
                  {formatDate(activity.date)}
                </span>
                <button className="activity-action">
                  <svg className="activity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
