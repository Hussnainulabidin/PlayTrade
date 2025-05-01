import React from "react"
import AdminChatPage from "../Admin/AdminDashboardChatPage"
import "../pages.css"
import "../../components/AdminDashboard/ui.css"
import "../Admin/AdminChat.css"

function ClientChatPage() {
  // Simply reuse the admin chat page component
  // The backend API filtering will ensure clients only see their own chats
  return <AdminChatPage isClientView={true} />
}

export default ClientChatPage 