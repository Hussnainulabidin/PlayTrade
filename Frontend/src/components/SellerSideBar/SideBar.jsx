import { Link, useLocation } from "react-router-dom"
import {
    Package,
    LayoutDashboard,
    Upload,
    ShoppingBag,
    ShoppingCart,
    Coins,
    Wallet,
    Gamepad2,
    ComputerIcon as Steam,
    Settings,
    Ticket,
    LogOut,
} from "lucide-react"
import "./Sidebar.css"

import { FiMessageSquare } from 'react-icons/fi';

const Sidebar = () => {
    const location = useLocation()

    const isActive = (path) => {
        return location.pathname.includes(path)
    }

    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logging out...')
    }

    return (
        <div className="sidebar">
            <div className="logo-container">
                <div className="logo">
                    <Package size={24} color="#fff" />
                </div>
                <div className="logo-text">Offers</div>
            </div>

            <nav className="sidebar-nav">
                <Link to="/seller/dashboard/accounts" className={`nav-item ${isActive("/accounts") ? "active" : ""}`}>
                    <LayoutDashboard size={18} />
                    <span>Accounts</span>
                </Link>
                <Link to="/seller-dashboard/chats" className={`nav-item ${isActive("/chats") ? "active" : ""}`}>
                    <FiMessageSquare size={18} />
                    <span>Chats</span>
                </Link>
                <Link to="/seller-dashboard/tickets" className={`nav-item ${isActive("/item-orders") ? "active" : ""}`}>
                    <Ticket size={18} />
                    <span>Tickets</span>
                </Link>
                <Link
                    to="/seller-dashboard/settings"
                    className={`nav-item ${isActive("/settings") ? "active" : ""}`}>
                    <Settings size={18} />
                    <span>Settings</span>
                </Link>
            </nav>

            <div className="logout-container">
                <button onClick={handleLogout} className="logout-button">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar
