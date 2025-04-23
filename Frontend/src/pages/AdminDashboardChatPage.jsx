import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { 
  Search, 
  Send, 
  MessageSquare
} from "lucide-react"
import { Input } from "../components/AdminDashboard/ui/input"
import axios from "axios"
import { useUser } from "../components/userContext/UserContext"
import "./AdminChat.css"

function AdminChatPage() {
  const { user } = useUser()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState(null)
  const [messageInput, setMessageInput] = useState("")
  const messageEndRef = useRef(null)

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true)
        // API endpoint with filter parameter
        const response = await axios.get(`http://localhost:3003/chats/my-chats`)
        console.log("Chats data:", response.data.data.chats)
        setChats(response.data.data.chats)
      } catch (err) {
        console.error("Error fetching chats:", err)
        setError("Failed to fetch chats. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [activeFilter])

  // Get the active chat details
  useEffect(() => {
    if (!activeChat) return
    
    const fetchChatDetails = async () => {
      try {
        setChatLoading(true)
        const response = await axios.get(`http://localhost:3003/chats/${activeChat}`)
        
        // Update the chat in the chats list with the full message details
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === activeChat ? response.data.data.chat : chat
          )
        )
      } catch (err) {
        console.error("Error fetching chat details:", err)
        setError("Failed to load chat details. Please try again.")
      } finally {
        setChatLoading(false)
      }
    }
    
    fetchChatDetails()
  }, [activeChat])

  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats, activeChat])

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !activeChat) return
    
    try {
      const response = await axios.post(`http://localhost:3003/chats/${activeChat}/messages`, {
        content: messageInput
      })
      
      // Update the chat with the new message
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat._id === activeChat) {
            // Create a copy of the chat
            const updatedChat = {...chat}
            
            // Initialize messages array if it doesn't exist
            if (!updatedChat.messages) {
              updatedChat.messages = []
            }
            
            // Add the new message
            updatedChat.messages.push(response.data.data.message)
            
            // Update last activity
            updatedChat.lastActivity = new Date()
            
            return updatedChat
          }
          return chat
        })
      )
      
      // Clear input
      setMessageInput("")
    } catch (err) {
      console.error("Error sending message:", err)
      alert("Failed to send message. Please try again.")
    }
  }

  // Apply filters and search
  const filteredChats = chats.filter(chat => {
    // Filter by chat type
    if (activeFilter === "tickets" && !chat.ticketId) return false
    if (activeFilter === "orders" && !chat.orderId) return false
    
    // Filter by search query
    if (searchQuery) {
      const senderName = chat.sender?.username?.toLowerCase() || ""
      const receiverName = chat.receiver?.username?.toLowerCase() || ""
      const query = searchQuery.toLowerCase()
      
      return senderName.includes(query) || receiverName.includes(query)
    }
    
    return true
  })
  
  // Sort by most recent activity
  const sortedChats = [...filteredChats].sort((a, b) => {
    return new Date(b.lastActivity) - new Date(a.lastActivity)
  })

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get the initial of a name for the avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  // Get the current active chat
  const currentChat = chats.find(chat => chat._id === activeChat)

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading chats...</div>
      </div>
    )
  }

  if (error) {
    return <div className="error-state">{error}</div>
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">Messages</h1>
      </div>
      
      <div className="filter-buttons">
        <button 
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Chats
        </button>
        <button 
          className={`filter-button ${activeFilter === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveFilter('tickets')}
        >
          Ticket Chats
        </button>
        <button 
          className={`filter-button ${activeFilter === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveFilter('orders')}
        >
          Order Chats
        </button>
      </div>

      <div className="chat-content">
        {/* Chat Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-search">
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder="Search chats..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="chat-list">
            {sortedChats.length === 0 ? (
              <div className="empty-state" style={{ height: "100%" }}>
                <MessageSquare size={24} className="empty-state-icon" />
                <p>No chats found</p>
              </div>
            ) : (
              sortedChats.map(chat => {
                // Determine if chat has unread messages
                const hasUnread = chat.messages?.some(msg => 
                  !msg.read && msg.sender.toString() !== user?._id
                ) || false
                
                // Get the other user (not the current user)
                const otherUser = chat.sender?._id === user?._id
                  ? chat.receiver
                  : chat.sender
                  
                const otherUsername = otherUser?.username || 
                  (chat.sender?._id === user?._id ? "Unknown Recipient" : "Unknown Sender")
                
                // Get the last message
                const lastMessage = chat.messages?.length > 0 
                  ? chat.messages[chat.messages.length - 1]
                  : null
                
                return (
                  <div 
                    key={chat._id} 
                    className={`chat-item ${activeChat === chat._id ? 'active' : ''}`}
                    onClick={() => setActiveChat(chat._id)}
                  >
                    <div className="chat-avatar">
                      {getInitial(otherUsername)}
                    </div>
                    <div className="chat-details">
                      <div className="chat-name">
                        <span>{otherUsername}</span>
                        <span className="timestamp">{formatDate(chat.lastActivity)}</span>
                      </div>
                      <div className="chat-preview">
                        {lastMessage ? lastMessage.content : "No messages yet"}
                      </div>
                    </div>
                    {hasUnread && <div className="unread-indicator"></div>}
                  </div>
                )
              })
            )}
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="chat-main">
          {!activeChat ? (
            <div className="empty-state">
              <MessageSquare size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">Select a chat to start messaging</h3>
              <p className="empty-state-description">
                Choose a conversation from the sidebar to view messages
              </p>
            </div>
          ) : chatLoading ? (
            <div className="loading-state">
              <div className="loader-spinner"></div>
              <div className="loader-text">Loading messages...</div>
            </div>
          ) : (
            <>
              <div className="chat-main-header">
                {currentChat && (
                  <>
                    <div className="chat-avatar">
                      {getInitial(
                        currentChat.sender?._id === user?._id
                          ? currentChat.receiver?.username || "Unknown Recipient"
                          : currentChat.sender?.username || "Unknown Sender"
                      )}
                    </div>
                    <div className="chat-main-title">
                      {currentChat.sender?._id === user?._id
                        ? currentChat.receiver?.username || "Unknown Recipient"
                        : currentChat.sender?.username || "Unknown Sender"}
                    </div>
                    <div className="chat-status">
                      {currentChat.orderId ? (
                        <Link to={`/order/${currentChat.orderId._id}`} className="seller-link">
                          Order #{currentChat.orderId.orderNumber || "Unknown"}
                        </Link>
                      ) : currentChat.ticketId ? (
                        <Link to={`/tickets/${currentChat.ticketId}`} className="seller-link">
                          Ticket #{currentChat.ticketId}
                        </Link>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
              
              <div className="chat-main-body">
                {currentChat?.messages?.length > 0 ? (
                  currentChat.messages.map((message, index) => {
                    // Check if message is from current user
                    const isOutgoing = message.sender.toString() === user?._id
                    
                    return (
                      <div 
                        key={index} 
                        className={`message ${isOutgoing ? 'outgoing' : 'incoming'}`}
                      >
                        {!isOutgoing && (
                          <div className="chat-avatar" style={{ width: "32px", height: "32px", fontSize: "0.75rem" }}>
                            {getInitial(
                              currentChat.sender?._id === user?._id
                                ? currentChat.receiver?.username || "Unknown Recipient"
                                : currentChat.sender?.username || "Unknown Sender"
                            )}
                          </div>
                        )}
                        <div>
                          <div className="message-content">
                            {message.content}
                          </div>
                          <div className="message-time">
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="empty-state">
                    <MessageSquare size={24} className="empty-state-icon" />
                    <p>No messages yet</p>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
              
              <div className="chat-main-footer">
                <form className="message-form" onSubmit={handleSendMessage}>
                  <textarea
                    className="message-input"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  ></textarea>
                  <button type="submit" className="send-button">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminChatPage 