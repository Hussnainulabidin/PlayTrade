"use client";
import { SellerWallet } from "../../components/SellerDashboard/SellerWallets/SellerWallets";
import { useEffect, useState } from "react";
import userApi from "../../api/userApi";
import "../pages.css";

function SellerWalletPage() {
    const [sellerId, setSellerId] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await userApi.getMe();
                setSellerId(userResponse.data.data._id);
            } catch (err) {
                console.error("Failed to fetch user data:", err);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="page-container">
            <SellerWallet sellerId={sellerId} />
        </div>
    );
}

export default SellerWalletPage; 