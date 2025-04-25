import ClientSidebar from "../ClientSidebar/ClientSidebar"
import "./ClientDashboardLayout.css"

const ClientDashboardLayout = ({ children }) => {
    return (
        <div className="client-dashboard-layout">
            <ClientSidebar />
            <div className="client-dashboard-content">{children}</div>
        </div>
    )
}

export default ClientDashboardLayout 