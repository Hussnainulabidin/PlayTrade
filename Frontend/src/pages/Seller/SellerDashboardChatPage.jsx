"use client"

import React from "react"
import CommonChatPage from "../Common/CommonChatPage"
import "../Admin/AdminChat.css"
import "../pages.css"
import "../../components/AdminDashboard/ui.css"

function SellerDashboardChatPage() {
  // Use the common chat page component with userType="seller"
  return <CommonChatPage userType="seller" />
}

export default SellerDashboardChatPage 