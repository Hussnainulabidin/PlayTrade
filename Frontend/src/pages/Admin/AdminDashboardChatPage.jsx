import React from "react"
import CommonChatPage from "../Common/CommonChatPage"
import "./AdminChat.css"

function AdminChatPage({ isClientView = false }) {
  // Use the common chat page component with userType="admin"
  return <CommonChatPage userType="admin" />
}

export default AdminChatPage 