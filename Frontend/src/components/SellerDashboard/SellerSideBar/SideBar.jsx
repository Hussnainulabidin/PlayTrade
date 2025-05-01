import { Link, useLocation, useNavigate } from "react-router-dom"
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
import "./SellerSideBar.css"
import AuthService from "../../AuthService/AuthService"

import { FiMessageSquare } from 'react-icons/fi';

const Sidebar = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path) => {
        return location.pathname.includes(path)
    }

    const handleLogout = () => {
        // Perform logout
        AuthService.logout()
        // Redirect to home page
        navigate('/')
    }

    return (
        <div className="pt-sidebar">
            <div className="pt-sidebar__logo-container">
                <div className="pt-sidebar__logo">
                    <Package size={24} color="#fff" />
                </div>
                <div className="pt-sidebar__logo-text">Offers</div>
            </div>

            <nav className="pt-sidebar__nav">
                <Link to="/seller/dashboard/accounts" className={`pt-sidebar__nav-item ${isActive("/accounts") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <LayoutDashboard size={18} />
                    <span>Accounts</span>
                </Link>
                <Link to="/seller-dashboard/chats" className={`pt-sidebar__nav-item ${isActive("/chats") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <FiMessageSquare size={18} />
                    <span>Chats</span>
                </Link>
                <Link to="/seller-dashboard/tickets" className={`pt-sidebar__nav-item ${isActive("/item-orders") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <Ticket size={18} />
                    <span>Tickets</span>
                </Link>
                <Link
                    to="/seller-dashboard/settings"
                    className={`pt-sidebar__nav-item ${isActive("/settings") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <Settings size={18} />
                    <span>Settings</span>
                </Link>
            </nav>

            <div className="pt-sidebar__logout-container">
                <button onClick={handleLogout} className="pt-sidebar__logout-button">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar
