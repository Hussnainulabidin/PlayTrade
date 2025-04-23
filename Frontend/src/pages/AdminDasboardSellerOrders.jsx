"use client"
import { useParams } from "react-router-dom"
import { SellerOrders } from "../components/AdminDashboard/SellerOrders";
import "./pages.css"


function SellerOrdersPage() {
    const { id } = useParams()
  
    return (
      <div className="page-container">
        <SellerOrders sellerId={id} />
      </div>
    )
  }
  
  export default SellerOrdersPage