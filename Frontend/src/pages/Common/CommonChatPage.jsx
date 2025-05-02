import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Send,
  MessageSquare
} from "lucide-react"
import { Input } from "../../components/AdminDashboard/ui/input"
import axios from "axios"
import { useUser } from "../../components/userContext/UserContext"
import { socketService } from "../../services"
import "../Admin/AdminChat.css"
import "./CommonChat.css"

function CommonChatPage({ userType = "client" }) {
  const { user } = useUser()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState(null)
  const [messageInput, setMessageInput] = useState("")

  // Socket-related states
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Auto-scroll to newest messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle sending messages
  const sendMessage = async (content) => {
    if (!content.trim() || !activeChat) {
      console.log("Message empty or chatData not available");
      return false;
    }

    // Try to send via socket first
    if (socketService.isConnected()) {
      const success = socketService.sendMessage(activeChat, content);
      if (success) {
        return true;
      }
    }

    // Fall back to REST API if socket is not connected
    try {
      console.log("Socket not connected, sending via REST API");

      const endpoint = `http://localhost:3003/chats/${activeChat}/messages`;
      console.log("Sending message to endpoint:", endpoint);

      const response = await axios.post(
        endpoint,
        { content: content },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.status === 'success') {
        const newMessage = response.data.data.message;
        const formattedMessage = {
          ...newMessage,
          // Ensure sender is properly formatted for consistent comparison
          sender: typeof newMessage.sender === 'object' ? newMessage.sender : { _id: newMessage.sender }
        };

        console.log("Message sent successfully via API:", formattedMessage);

        setMessages(prev => [...prev, formattedMessage]);
        scrollToBottom();
        return true;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response) {
        console.error("API response error:", err.response.data);
      }
    }
    return false;
  };

  // Handle typing status
  const handleTyping = (isTypingStatus) => {
    if (activeChat) {
      socketService.sendTypingStatus(activeChat, isTypingStatus);
    }
  };

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true)
        // API endpoint for chats
        const response = await axios.get(`http://localhost:3003/chats/my-chats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        console.log("Chats data:", response.data.data.chats);

        // Get basic chat data
        let updatedChats = response.data.data.chats;

        // If any chat doesn't have a last message, fetch basic details
        const chatsToUpdate = updatedChats.filter(chat =>
          !chat.messages || chat.messages.length === 0
        );

        if (chatsToUpdate.length > 0) {
          console.log("Fetching basic message info for chats without messages", chatsToUpdate.map(c => c._id));

          // Fetch basic info for these chats
          for (const chat of chatsToUpdate) {
            try {
              const chatDetailsResponse = await axios.get(`http://localhost:3003/chats/${chat._id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              if (chatDetailsResponse.data.status === 'success' && chatDetailsResponse.data.data.chat) {
                // Find and update this chat in our array
                updatedChats = updatedChats.map(c =>
                  c._id === chat._id ? chatDetailsResponse.data.data.chat : c
                );
              }
            } catch (detailsErr) {
              console.error("Error fetching chat details for preview:", detailsErr);
            }
          }
        }

        setChats(updatedChats);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Failed to fetch chats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [activeFilter]);

  // Socket connection and chat setup
  useEffect(() => {
    if (!activeChat) return;

    console.log("Initializing socket for chatId:", activeChat);

    // Initialize socket if not already connected
    socketService.initializeSocket();

    // Set initial connection status
    setIsConnected(socketService.isConnected());

    // Join the chat
    socketService.joinChat(activeChat);

    // No need to fetch messages here - already done in the fetchChatDetails useEffect

    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      socketService.joinChat(activeChat);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (data) => {
      if (data.chatId === activeChat) {
        setMessages(prev => {
          // Ensure we have the complete message with properly formatted sender info
          const newMsg = {
            ...data.message,
            sender: typeof data.message.sender === 'object'
              ? data.message.sender
              : { _id: data.message.sender, username: "Unknown" }
          };

          // Check if message is already in the list to prevent duplicates
          const isDuplicate = prev.some(msg => msg._id === newMsg._id);
          if (!isDuplicate) {
            console.log("Adding new message from socket:", newMsg, "Current user:", user?._id);

            // Also update the chat in the chat list to show updated preview
            setChats(prevChats =>
              prevChats.map(chat => {
                if (chat._id === activeChat) {
                  // Create a new messages array or append to existing one
                  const updatedMessages = chat.messages ? [...chat.messages, newMsg] : [newMsg];
                  return {
                    ...chat,
                    messages: updatedMessages,
                    lastActivity: new Date()
                  };
                }
                return chat;
              })
            );

            const updatedMessages = [...prev, newMsg];
            setTimeout(() => scrollToBottom(), 100);
            return updatedMessages;
          }
          return prev;
        });
      }
    };

    const handleUserTyping = (data) => {
      if (data.chatId === activeChat) {
        setIsTyping(data.isTyping);
      }
    };

    // Register event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('newMessage', handleNewMessage);
    socketService.on('userTyping', handleUserTyping);

    // Clean up on unmount
    return () => {
      // Make sure we leave the chat room when unmounting
      if (activeChat && socketService.isConnected()) {
        console.log("Leaving chat room:", activeChat);
        socketService.leaveChat(activeChat);
      }

      // Remove event listeners
      console.log("Removing socket event listeners");
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('newMessage', handleNewMessage);
      socketService.off('userTyping', handleUserTyping);
    };
  }, [activeChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message input changes
  const handleMessageInputChange = (e) => {
    const text = e.target.value;
    setMessageInput(text);
    handleTyping(text.length > 0);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !activeChat) return

    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput("")
      handleTyping(false)

      // Update the last activity for the chat
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === activeChat) {
            return { ...chat, lastActivity: new Date() };
          }
          return chat;
        })
      );
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

  // Truncate message content for preview
  const truncateMessage = (content, maxLength) => {
    if (!content) return "";
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  // Get the initial of a name for the avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  // Get the current active chat
  const currentChat = chats.find(chat => chat._id === activeChat)

  // Get the active chat details
  useEffect(() => {
    if (!activeChat) return;

    const fetchChatDetails = async () => {
      try {
        setChatLoading(true);
        const response = await axios.get(`http://localhost:3003/chats/${activeChat}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.status === 'success' && response.data.data.chat) {
          // Update the chat in the chats list with the full message details
          setChats(prevChats =>
            prevChats.map(chat =>
              chat._id === activeChat ? response.data.data.chat : chat
            )
          );

          // Set messages for the active chat from the response
          const chatMessages = response.data.data.chat.messages || [];
          const formattedMessages = chatMessages.map(msg => ({
            ...msg,
            sender: typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender }
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error("Error fetching chat details:", err);
        setError("Failed to load chat details. Please try again.");
      } finally {
        setChatLoading(false);
      }
    };

    fetchChatDetails();
  }, [activeChat]);

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
    <div className="chat-container p-0 min-h-full">

      <div className="filter-buttons p-4 pb-0">
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

      <div className="chat-content px-4 w-full">
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
                  : null;

                // For debugging
                console.log(`Chat ${chat._id} - Has messages: ${!!chat.messages}, Count: ${chat.messages?.length || 0}, Last message:`, lastMessage);

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
                        {lastMessage ?
                          truncateMessage(lastMessage.content, 30) :
                          "No messages yet"}
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
                          Order #{currentChat.orderId._id || "Unknown"}
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
                {messages && messages.length > 0 ? (
                  messages.map((message, index) => {
                    // Check if this is a system message
                    const isSystemMessage = message.isSystemMessage ||
                      (message.content && message.content.startsWith("(System)"));

                    // If it's a system message, display it centered
                    if (isSystemMessage) {
                      // Format the message content (remove the "(System)" prefix if present)
                      let messageContent = message.content;
                      if (messageContent && messageContent.startsWith("(System)")) {
                        messageContent = messageContent.substring(8).trim(); // Remove "(System)" prefix
                      }

                      return (
                        <div key={index} className="message system-message">
                          <div className="system-message-content">
                            {messageContent}
                          </div>
                          <div className="message-time">
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      );
                    }

                    // Handle different sender formats (object or string)
                    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                    const isOutgoing = senderId && user && senderId.toString() === user._id.toString();

                    console.log("Message:", index, "sender:", senderId, "currentUser:", user?._id, "isOutgoing:", isOutgoing);

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
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-main-footer">
                <form className="message-form" onSubmit={handleSendMessage}>
                  <textarea
                    className="message-input"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleMessageInputChange}
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

export default CommonChatPage 