"use client"
import { DisputedOrders } from "../components/AdminDashboard/DisputedOrders";
import "./pages.css"
// import "../components/AdminDashboard/DisputedOrders.css"

function DisputedOrdersPage() {
  return (
    <div className="page-container">
      <DisputedOrders />
    </div>
  )
}

export default DisputedOrdersPage 