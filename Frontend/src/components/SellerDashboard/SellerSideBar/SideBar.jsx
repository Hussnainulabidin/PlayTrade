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
    User,
    Crown
} from "lucide-react"
import "./SellerSideBar.css"
import AuthService from "../../AuthService/AuthService"
import { useState, useEffect } from "react"
import { FiMessageSquare } from 'react-icons/fi';

const Sidebar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isOpen, setIsOpen] = useState(!isMobile);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsOpen(true);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            <Link to="/" className="pt-sidebar__logo-container">
                <div className="pt-sidebar__logo">
                    <Crown size={24} color="#fff" />
                </div>
                <div className="pt-sidebar__logo-text">
                    <span className="text-blue-500">PLAY</span>TRADE
                </div>
            </Link>

            <nav className="pt-sidebar__nav">
                <Link to="/seller/dashboard/accounts" className={`pt-sidebar__nav-item ${isActive("/accounts") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <LayoutDashboard size={18} />
                    <span>Accounts</span>
                </Link>
                <Link to="/seller-dashboard/chats" className={`pt-sidebar__nav-item ${isActive("/chats") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <FiMessageSquare size={18} />
                    <span>Chats</span>
                </Link>
                <Link to="/seller-dashboard/tickets" className={`pt-sidebar__nav-item ${isActive("/tickets") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <Ticket size={18} />
                    <span>Tickets</span>
                </Link>
                <Link to="/seller-dashboard/wallet" className={`pt-sidebar__nav-item ${isActive("/wallet") ? "pt-sidebar__nav-item--active" : ""}`}>
                    <Wallet size={18} />
                    <span>Wallet</span>
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
