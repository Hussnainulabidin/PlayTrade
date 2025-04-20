"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/AdminDashboard/DashboardHeader";
import { SellerWallet } from "../components/AdminDashboard/SellerWallets";
import "./pages.css"

function SellerWalletPage() {
    const { id } = useParams()
  
    return (
      <div className="page-container">
        <DashboardHeader title={`Wallet for Seller: ${id}`} />
        <SellerWallet sellerId={id} />
      </div>
    )
}

export default SellerWalletPage