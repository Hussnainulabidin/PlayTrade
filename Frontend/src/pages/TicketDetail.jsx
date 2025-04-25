"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Paperclip, Smile } from "lucide-react"
import { Button } from "../components/AdminDashboard/ui/button"
import { Badge } from "../components/AdminDashboard/ui/badge"
import { Textarea } from "../components/AdminDashboard/ui/textarea"
import axios from "axios"
import io from "socket.io-client"
import "./TicketDetails.css"

function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Fetch ticket data
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:3003/tickets/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.data.status === 'success') {
          setTicket(response.data.data.ticket)

          // Fetch chat messages if chatId exists - make sure chatId is a string
          if (response.data.data.ticket.chatId) {
            try {
              const chatId = response.data.data.ticket.chatId._id || response.data.data.ticket.chatId;

              const chatResponse = await axios.get(`http://localhost:3003/chats/${chatId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              })

              if (chatResponse.data.status === 'success') {
                setMessages(chatResponse.data.data.chat.messages || [])
              }
            } catch (chatError) {
              console.error('Error fetching chat data:', chatError)
              // Don't set error state for chat fetch issues - we can still show the ticket
              // Just set empty messages
              setMessages([])
            }
          }
        } else {
          setError('Failed to fetch ticket details')
        }
      } catch (err) {
        console.error('Error fetching ticket details:', err)
        setError(err.response?.data?.message || 'An error occurred while fetching ticket details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTicketDetails()
    }
  }, [id])

  // Socket connection
  useEffect(() => {
    // Only attempt socket connection if ticket exists
    if (!ticket) return;

    // Handle case where chatId doesn't exist or may be invalid
    if (!ticket.chatId) {
      console.log('No chat ID available for this ticket');
      setIsConnected(false);
      return;
    }

    // Get the actual chatId value, being defensive about possible formats
    let chatId;
    try {
      chatId = typeof ticket.chatId === 'object' && ticket.chatId._id
        ? ticket.chatId._id
        : ticket.chatId;

      // Additional validation to ensure chatId is a valid string
      if (!chatId || typeof chatId !== 'string') {
        console.error('Invalid chat ID format:', ticket.chatId);
        setIsConnected(false);
        return;
      }
    } catch (error) {
      console.error('Error extracting chat ID:', error);
      setIsConnected(false);
      return;
    }

    console.log('Attempting to connect to socket with chat ID:', chatId);

    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      setIsConnected(false);
      return;
    }

    // Connect to socket with correct authentication
    const socket = io('http://localhost:3003', {
      auth: {
        token: token
      },
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketRef.current = socket;

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket.id);
      setIsConnected(true);

      // Join chat room - in this case we need to use joinChat for the backend
      socket.emit('joinChat', chatId);
      console.log('Emitted joinChat event for chat ID:', chatId);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setIsConnected(false);
    });

    socket.on('joinedChat', (data) => {
      console.log('Successfully joined chat room:', data);
    });

    socket.on('newMessage', (data) => {
      // Handle new message event from socket
      console.log('Received new message:', data);
      if (data.message) {
        const newMsg = {
          sender: data.message.sender._id,
          senderName: data.message.sender.username,
          content: data.message.content,
          timestamp: data.message.timestamp
        };
        setMessages(prev => [...prev, newMsg]);
      }
    });

    socket.on('userTyping', (data) => {
      setIsTyping(data.isTyping);
    });

    // Clean up on unmount
    return () => {
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.disconnect();
      }
    }
  }, [ticket])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleTyping = (isCurrentlyTyping) => {
    if (!socketRef.current || !ticket?.chatId) return;

    const chatId = ticket.chatId._id || ticket.chatId;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing event
    socketRef.current.emit('typing', {
      chatId: chatId,
      isTyping: isCurrentlyTyping
    });

    // Set timeout to stop typing indicator after 2 seconds
    if (isCurrentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('typing', {
            chatId: chatId,
            isTyping: false
          });
        }
      }, 2000);
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() || !socketRef.current || !ticket?.chatId) return;

    const chatId = ticket.chatId._id || ticket.chatId;

    // Send message through socket
    socketRef.current.emit('sendMessage', {
      chatId: chatId,
      content: message
    });

    // Reset message input and typing status
    setMessage("");
    handleTyping(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleMessageChange = (e) => {
    const text = e.target.value
    setMessage(text)
    handleTyping(text.length > 0)
  }

  const handleGoBack = () => {
    navigate('/dashboard/tickets')
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    // Format: Apr 16, 10:45 PM
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Add a detailed date formatting function
  const formatDetailedDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    // Format: Tuesday, April 16, 2024 at 10:45 PM
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper to determine message type for rendering
  const getMessageType = (message) => {
    const userId = localStorage.getItem('userId');
    return message.sender === userId ? 'current-user' : 'other-user';
  };

  // Update the getChatParticipantInfo to use the component-level currentUserId
  const getChatParticipantInfo = () => {
    // If current user is the assigned admin, show seller info
    if (isCurrentUserAdmin) {
      if (ticket.sellerId) {
        return {
          name: ticket.sellerId.username || 'Seller',
          username: ticket.sellerId.username,
          avatar: ticket.sellerId.username ? ticket.sellerId.username.charAt(0).toUpperCase() : 'S',
          role: 'Seller'
        };
      }
      return { name: 'Seller', avatar: 'S', role: 'Seller' };
    }
    // If current user is seller, show admin info
    else {
      if (ticket.assignedAdmin) {
        return {
          name: ticket.assignedAdmin.username || 'Support Agent',
          username: ticket.assignedAdmin.username,
          avatar: ticket.assignedAdmin.username ? ticket.assignedAdmin.username.charAt(0).toUpperCase() : 'A',
          role: 'Support Agent'
        };
      }
      return { name: 'Support Team', avatar: 'S', role: 'Support Agent' };
    }
  };
  
  const handleCloseTicket = async () => {
    if (!ticket || !ticket._id) return;
    
    try {
      // Ask for confirmation
      if (!window.confirm("Are you sure you want to close this ticket?")) {
        return;
      }
      
      // Call the API to update ticket status
      const response = await axios.patch(
        `http://localhost:3003/tickets/${ticket._id}/status`,
        { status: 'Closed' },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the local ticket state
        setTicket(prevTicket => ({
          ...prevTicket,
          status: 'Closed'
        }));
        
        // Optionally show a success message
        alert("Ticket has been closed successfully");
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert("Failed to close ticket. Please try again.");
    }
  };
  
  const handleReopenTicket = async () => {
    if (!ticket || !ticket._id) return;
    
    try {
      // Ask for confirmation
      if (!window.confirm("Are you sure you want to reopen this ticket?")) {
        return;
      }
      
      // Call the API to update ticket status
      const response = await axios.patch(
        `http://localhost:3003/tickets/${ticket._id}/status`,
        { status: 'Open' },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the local ticket state
        setTicket(prevTicket => ({
          ...prevTicket,
          status: 'Open'
        }));
        
        // Optionally show a success message
        alert("Ticket has been reopened successfully");
      }
    } catch (error) {
      console.error('Error reopening ticket:', error);
      alert("Failed to reopen ticket. Please try again.");
    }
  };
  
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader-spinner"></div>
        <div className="loader-text">Loading ticket details...</div>
      </div>
    )
  }

  if (error) {
    return <div className="error-state">{error}</div>
  }

  if (!ticket) {
    return <div className="error-state">Ticket not found</div>
  }

  // Check if ticket has no assigned admin
  if (!ticket.assignedAdmin) {
    return (
      <div className="ticket-detail-page">
        <div className="ticket-detail-header">
          <div className="ticket-back-link" onClick={handleGoBack}>
            <ArrowLeft className="ticket-back-icon" />
            <span>All Tickets</span>
          </div>
          <h1 className="ticket-detail-title">
            Ticket #{ticket._id?.slice(-6)}: {ticket.ticketType}
          </h1>
        </div>

        <div className="waiting-container">
          <div className="waiting-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#6c5ce7" strokeWidth="1.5" />
              <path d="M12 6V12L16 14" stroke="#6c5ce7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="waiting-title">Your ticket has been created</h2>
          <p className="waiting-message">
            Please wait until our admin team joins to resolve your issue.
            You will be notified once an admin has been assigned to your ticket.
          </p>
          <div className="waiting-ticket-info">
            <div className="waiting-ticket-item">
              <span className="waiting-ticket-label">Ticket ID:</span>
              <span className="waiting-ticket-value">#{ticket._id?.slice(-6)}</span>
            </div>
            <div className="waiting-ticket-item">
              <span className="waiting-ticket-label">Type:</span>
              <span className="waiting-ticket-value">{ticket.ticketType}</span>
            </div>
            <div className="waiting-ticket-item">
              <span className="waiting-ticket-label">Status:</span>
              <span className="waiting-ticket-value">{ticket.status}</span>
            </div>
            <div className="waiting-ticket-item">
              <span className="waiting-ticket-label">Created:</span>
              <span className="waiting-ticket-value">{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
          <button className="waiting-button" onClick={handleGoBack}>
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  // Calculate if the current user is the assigned admin
  const currentUserId = localStorage.getItem('userId');
  const isCurrentUserAdmin = ticket && ticket.assignedAdmin &&
    ticket.assignedAdmin._id === currentUserId;

  return (
    <div className="ticket-detail-page">
      <div className="ticket-detail-header">
        <div className="ticket-back-link" onClick={handleGoBack}>
          <ArrowLeft className="ticket-back-icon" />
          <span>All Tickets</span>
        </div>
        <h1 className="ticket-detail-title">
          Ticket #{ticket._id?.slice(-6)}: {ticket.ticketType}
        </h1>
      </div>

      <div className="ticket-detail-content">
        <div className="ticket-chat-container">
          <div className="chat-header">
            <div className="user-info">
              {ticket && (
                <>
                  <div className="user-avatar">
                    {getChatParticipantInfo().avatar}
                  </div>
                  <div className="user-details">
                    <h4 className="user-name">
                      {getChatParticipantInfo().name}
                      {getChatParticipantInfo().username && ` (@${getChatParticipantInfo().username})`}
                    </h4>
                    <p className="user-type">{getChatParticipantInfo().role}</p>
                  </div>
                  <div className="connection-status">
                    <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
                    {isConnected ? 'Online' : 'Offline'}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${
                    msg.isSystemMessage 
                      ? 'system-message' 
                      : getMessageType(msg) === 'current-user' 
                        ? 'current-user-message' 
                        : 'other-user-message'
                  }`}
                >
                  {!msg.isSystemMessage ? (
                    <>
                      <div className="message-avatar">
                        {getMessageType(msg) === 'current-user' 
                          ? (localStorage.getItem('username')?.charAt(0).toUpperCase() || 'Y')
                          : (isCurrentUserAdmin 
                              ? (ticket.sellerId?.username?.charAt(0).toUpperCase() || 'S') 
                              : (ticket.assignedAdmin?.username?.charAt(0).toUpperCase() || 'A'))}
                      </div>
                      <div className="message-content">
                        <div className="message-sender">
                          {getMessageType(msg) === 'current-user' 
                            ? 'You' 
                            : (isCurrentUserAdmin 
                                ? (ticket.sellerId?.username || 'Seller')
                                : (ticket.assignedAdmin?.username || 'Support Agent'))}
                        </div>
                        <p className="message-text">{msg.content}</p>
                        <div className="message-time" title={formatDetailedDate(msg.timestamp)}>
                          {formatDate(msg.timestamp)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="system-message-content">
                      <div className="system-message-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <p className="system-message-text">{msg.content}</p>
                      <div className="message-time" title={formatDetailedDate(msg.timestamp)}>
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {isTyping && (
              <div className="typing-indicator">
                <div className="dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              className="input-field"
              disabled={!isConnected || !ticket.chatId}
            />
            <Button variant="ghost" size="icon" className="input-icon">
              <Paperclip size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="input-icon">
              <Smile size={20} />
            </Button>
            <Button
              onClick={handleSendMessage}
              className="send-btn"
              disabled={!message.trim() || !isConnected || !ticket.chatId}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>

        <div className="ticket-details-sidebar">
          <div className="ticket-details-card">
            <h2>Ticket Details</h2>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Agent</span>
              <span className="ticket-detail-value">
                <span className="ticket-agent-badge">
                  {ticket.assignedAdmin?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                {ticket.assignedAdmin?.username || 'Unassigned'}
              </span>
            </div>
            <h3 className="ticket-properties-heading">Properties</h3>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Category</span>
              <span className="ticket-detail-value">
                <Badge className="tickets-category-marketplace">{ticket.ticketType}</Badge>
              </span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Submitted By</span>
              <span className="ticket-detail-value">
                {ticket.sellerId?.username || 'Unknown'}
              </span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Submitted At</span>
              <span className="ticket-detail-value">{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Status</span>
              <span className="ticket-detail-value">
                <Badge className={`tickets-status-${ticket.status?.toLowerCase()}`}>{ticket.status}</Badge>
              </span>
            </div>
            <div className="ticket-detail-item">
              <span className="ticket-detail-label">Ticket ID</span>
              <span className="ticket-detail-value">#{ticket._id?.slice(-6)}</span>
            </div>
            <div className="ticket-actions">
              {/* Only show Close Ticket button if the ticket is Open */}
              {ticket.status === 'Open' && (
                <Button
                  className="ticket-action-button close-ticket-button"
                  style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none' }}
                  onClick={handleCloseTicket}
                >
                  Close Ticket
                </Button>
              )}

              {/* Show Reopen button only if the ticket is Closed */}
              {ticket.status === 'Closed' && (
                <Button
                  className="ticket-action-button reopen-ticket-button"
                  style={{ backgroundColor: '#3498db', color: 'white', border: 'none' }}
                  onClick={handleReopenTicket}
                >
                  Reopen Ticket
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPage
