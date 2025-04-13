import { Sidebar } from "../components/AdminDashboard/Sidebar"
import "./pages.css"

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">{children}</div>
    </div>
  )
}

export default DashboardLayout