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
} from "lucide-react"
import "./Sidebar.css"

import { FiMessageSquare } from 'react-icons/fi';

const Sidebar = () => {
    const location = useLocation()

    const isActive = (path) => {
        return location.pathname.includes(path)
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
        </div>
    )
}

export default Sidebar
