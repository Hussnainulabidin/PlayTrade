"use client"
import { useParams } from "react-router-dom"
import { DashboardHeader } from "../components/AdminDashboard/DashboardHeader";
import { SellerOrders } from "../components/AdminDashboard/SellerOrders";
import "./pages.css"


function SellerOrdersPage() {
    const { id } = useParams()
  
    return (
      <div className="page-container">
        <DashboardHeader title={`Orders for Seller: ${id}`} />
        <SellerOrders sellerId={id} />
      </div>
    )
  }
  
  export default SellerOrdersPage