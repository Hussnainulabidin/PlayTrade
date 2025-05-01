"use client"
import { useParams } from "react-router-dom"
import { DashboardHeader } from "../../components/AdminDashboard/DashboardHeader";
import { SellerDetails } from "../../components/AdminDashboard/SellerDetails"
import "../pages.css"

function SellerDetailsPage() {
  const { id } = useParams()

  return (
    <div className="page-container">
      <DashboardHeader title={`Seller: ${id}`} />
      <SellerDetails sellerId={id} />
    </div>
  )
}

export default SellerDetailsPage