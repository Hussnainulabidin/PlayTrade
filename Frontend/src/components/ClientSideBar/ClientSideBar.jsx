import { Link, useLocation } from "react-router-dom"
import { ShoppingBag, MessageSquare, Settings, LogOut } from "lucide-react"
import { useUser } from "../userContext/UserContext"
import "./ClientSideBar.css"

const ClientSidebar = () => {
  const location = useLocation()
  // eslint-disable-next-line no-unused-vars
  const { user, logout } = useUser()

  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  return (
    <div className="client-sidebar">
      <Link to="/" className="sidebar-header-link">
        <div className="sidebar-header">
          <h2>PlayTrade</h2>
          <p className="role-badge">Client</p>
        </div>
      </Link>

      <nav className="sidebar-nav">
        <Link
          to="/client/orders"
          className={`nav-item ${isActive("/client/orders") ? "active" : ""}`}
        >
          <ShoppingBag size={20} />
          <span>Orders</span>
        </Link>
        <Link
          to="/client/chat"
          className={`nav-item ${isActive("/client/chat") ? "active" : ""}`}
        >
          <MessageSquare size={20} />
          <span>Chat</span>
        </Link>
        <Link
          to="/client/settings"
          className={`nav-item ${isActive("/client/settings") ? "active" : ""}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default ClientSidebar 