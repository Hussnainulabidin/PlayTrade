import React from "react"
import CommonChatPage from "../Common/CommonChatPage"
import "../pages.css"
import "../../components/AdminDashboard/ui.css"
import "../Admin/AdminChat.css"

function ClientChatPage() {
  // Use the common chat page component with userType="client"
  return <CommonChatPage userType="client" />
}

export default ClientChatPage 