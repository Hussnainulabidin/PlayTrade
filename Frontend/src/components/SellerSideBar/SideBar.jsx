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
} from "lucide-react"
import "./Sidebar.css"

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
                <Link to="/seller-dashboard/accounts" className={`nav-item ${isActive("/accounts") ? "active" : ""}`}>
                    <LayoutDashboard size={18} />
                    <span>Accounts</span>
                </Link>
                <Link
                    to="/seller-dashboard/account-imports"
                    className={`nav-item ${isActive("/account-imports") ? "active" : ""}`}
                >
                    <Upload size={18} />
                    <span>Account Imports</span>
                </Link>
                <Link to="/seller-dashboard/items" className={`nav-item ${isActive("/items") ? "active" : ""}`}>
                    <ShoppingBag size={18} />
                    <span>Items</span>
                </Link>
                <Link to="/seller-dashboard/item-orders" className={`nav-item ${isActive("/item-orders") ? "active" : ""}`}>
                    <ShoppingCart size={18} />
                    <span>Item Orders</span>
                </Link>
                <Link to="/seller-dashboard/currencies" className={`nav-item ${isActive("/currencies") ? "active" : ""}`}>
                    <Coins size={18} />
                    <span>Currencies</span>
                </Link>
                <Link
                    to="/seller-dashboard/currency-orders"
                    className={`nav-item ${isActive("/currency-orders") ? "active" : ""}`}
                >
                    <Wallet size={18} />
                    <span>Currency Orders</span>
                </Link>
                <Link to="/seller-dashboard/cs2-skins" className={`nav-item ${isActive("/cs2-skins") ? "active" : ""}`}>
                    <Gamepad2 size={18} />
                    <span>CS2 Skins</span>
                </Link>
                <Link
                    to="/seller-dashboard/steam-inventory"
                    className={`nav-item ${isActive("/steam-inventory") ? "active" : ""}`}
                >
                    <Steam size={18} />
                    <span>Steam Inventory</span>
                </Link>
            </nav>
        </div>
    )
}

export default Sidebar
