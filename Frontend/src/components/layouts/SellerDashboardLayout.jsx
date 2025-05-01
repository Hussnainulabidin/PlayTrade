import Sidebar from "../SellerDashboard/SellerSideBar/SideBar"
import "./SellerDashboardLayout.css"

const SellerDashboardLayout = ({ children }) => {
    return (
        <div className="seller-dashboard-layout">
            <Sidebar />
            <div className="seller-dashboard-content">{children}</div>
        </div>
    )
}

export default SellerDashboardLayout
