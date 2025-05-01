"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Send, Paperclip, Smile } from "lucide-react"
import { Button } from "../../components/AdminDashboard/ui/button"
import { Badge } from "../../components/AdminDashboard/ui/badge"
import { Textarea } from "../../components/AdminDashboard/ui/textarea"
import { ticketApi, chatApi } from "../../api"
import axios from "axios"
import { socketService } from "../../services"
import { useUser } from "../../components/userContext/UserContext"
import "./TicketDetails.css"

function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const [message, setMessage] = useState("")
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  // Determine if this is a client or admin view based on the URL path
  const isClientView = location.pathname.includes('/client/tickets/')

  // Auto-scroll to newest messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch chat messages
  const fetchChatMessages = async (chatId) => {
    if (!chatId) {
      console.error("Cannot fetch chat messages: chatId is missing");
      return;
    }
    
    try {
      console.log("Fetching chat messages for chatId:", chatId);
      
      // Use the chat API to get chat by ID
      const response = await chatApi.getChatById(chatId);
      
      if (response.data.status === 'success') {
        // Handle different response formats
        const chat = response.data.data.chat;
        
        console.log("Received chat data:", chat);
        
        if (chat && chat.messages && Array.isArray(chat.messages)) {
          setMessages(chat.messages);
          scrollToBottom();
        } else {
          console.log("No messages found or invalid format");
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
    }
  };

  // Handle sending messages
  const handleSendMessage = async (content) => {
    if (!content.trim() || !ticket?.chatId) {
      console.log("Message empty or chatData not available");
      return false;
    }
    
    const chatId = typeof ticket.chatId === 'object' ? ticket.chatId._id : ticket.chatId;
    
    // Check if this is a system message (admin only)
    const isSystemMessage = !isClientView && user?.role === 'admin' && content.startsWith("(System)");
    
    // Try to send via socket first
    if (socketService.isConnected()) {
      const success = socketService.sendMessage(chatId, content, isSystemMessage);
      if (success) {
        return true;
      }
    } 
    
    // Fall back to REST API if socket is not connected
    try {
      console.log("Socket not connected, sending via REST API");
      
      // Use the chat API to send a message
      const response = await chatApi.sendMessage(chatId, { 
        content,
        isSystemMessage 
      });
      
      if (response.data.status === 'success') {
        const newMessage = response.data.data.message;
        const formattedMessage = {
          ...newMessage,
          sender: newMessage.sender,
          isSystemMessage
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
    if (ticket?.chatId) {
      const chatId = typeof ticket.chatId === 'object' ? ticket.chatId._id : ticket.chatId;
      socketService.sendTypingStatus(chatId, isTypingStatus);
    }
  };

  // Fetch ticket data - modified to handle both admin and client views
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true)
        
        // Use different API endpoints based on user role
        let response
        
        if (isClientView && user?._id) {
          // For client view
          response = await ticketApi.getClientTicketById(user._id, id)
        } else {
          // For admin view
          response = await ticketApi.getTicketById(id)
        }

        if (response.data.status === 'success') {
          setTicket(response.data.data.ticket)
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
  }, [id, user, isClientView])

  // Socket connection and chat setup
  useEffect(() => {
    if (!ticket?.chatId) return;
    
    const chatId = typeof ticket.chatId === 'object' ? ticket.chatId._id : ticket.chatId;
    console.log("Initializing socket for chatId:", chatId);
    
    // Initialize socket if not already connected
    socketService.initializeSocket();

    // Set initial connection status
    setIsConnected(socketService.isConnected());
    
    // Join the chat
    socketService.joinChat(chatId);
    
    // Fetch existing messages
    fetchChatMessages(chatId);

    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      socketService.joinChat(chatId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleNewMessage = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => {
        const newMsg = {
            ...data.message,
            sender: data.message.sender || {
              _id: data.message.sender._id,
              username: data.message.sender.username
            }
          };
          // Check if message is already in the list to prevent duplicates
          const isDuplicate = prev.some(msg => msg._id === newMsg._id);
          if (!isDuplicate) {
            const updatedMessages = [...prev, newMsg];
            setTimeout(() => scrollToBottom(), 100);
            return updatedMessages;
          }
          return prev;
        });
      }
    };
    
    const handleUserTyping = (data) => {
      if (data.chatId === chatId) {
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
      socketService.leaveChat(chatId);
      
      // Remove event listeners
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('newMessage', handleNewMessage);
      socketService.off('userTyping', handleUserTyping);
    };
  }, [ticket?.chatId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessageClick = () => {
    if (!message.trim() || !ticket?.chatId) return;

    const success = handleSendMessage(message);
    if (success) {
      setMessage('');

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      handleTyping(false);
  }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageClick();
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Debounce typing status
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator if there's content
    handleTyping(e.target.value.length > 0);
    
    // Clear typing indicator after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 3000);
  };

  const handleGoBack = () => {
    // Redirect to the appropriate tickets page based on user role
    if (isClientView) {
      navigate('/client/tickets')
    } else {
      navigate(-1)
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDetailedDate = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timePart = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${datePart} at ${timePart}`;
  };

  const getMessageType = (message) => {
    const currentUserId = user?._id;
    
    // Handle different sender formats that might come from the API or socket
    if (!message.sender) {
      return 'incoming';
    }
    
    if (typeof message.sender === 'string') {
      return message.sender === currentUserId ? 'outgoing' : 'incoming';
    }
    
    if (typeof message.sender === 'object') {
      return message.sender._id === currentUserId ? 'outgoing' : 'incoming';
    }
    
    return 'incoming';
  };

  const getChatParticipantInfo = () => {
    if (!ticket) return { name: 'User', isOnline: false, avatar: 'U', role: 'User' };

    // For client view
    if (isClientView) {
      // The other participant is the admin
      return {
        name: ticket.assignedAdmin?.username || 'Support Agent',
        isOnline: isConnected,
        avatar: (ticket.assignedAdmin?.username?.charAt(0).toUpperCase()) || 'S',
        role: 'Support Agent'
      };
    }
    
    // For admin view
    const currentUserId = user?._id
    const isAdmin = ticket.assignedAdmin?._id === currentUserId
    
    // Determine the other participant (seller or client)
    let name, isOnline, avatar, role
    
    if (ticket.ticketType === 'Client Ticket') {
      // For client tickets, show client info
      name = ticket.clientId?.username || 'Client'
      avatar = name.charAt(0).toUpperCase() || 'C'
      role = 'Client'
    } else {
      // For seller tickets, show seller info
      name = ticket.sellerId?.username || 'Seller'
      avatar = name.charAt(0).toUpperCase() || 'S'
      role = 'Seller'
    }
    
    isOnline = isConnected // This can be improved to check actual user status
    
    return { name, isOnline, avatar, role }
  };

  const handleCloseTicket = async () => {
    // Confirm before closing
    if (!window.confirm('Are you sure you want to close this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      // Use the ticketApi to close the ticket
      const response = await ticketApi.closeTicket(id);

      if (response.data.status === 'success') {
        // Update the local state
        setTicket(prev => ({
          ...prev,
          status: 'Closed'
        }));

        // Send system message to chat
        if (ticket.chatId) {
          const chatId = ticket.chatId._id || ticket.chatId;

          // Use the chatApi to send a system message
          await chatApi.sendMessage(chatId, {
            content: 'Ticket has been closed by support agent.',
            isSystemMessage: true
          });
        }

        // Show success message
        alert('Ticket has been closed successfully');
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert('Failed to close ticket. Please try again.');
    }
  };

  const handleReopenTicket = async () => {
    // Confirm before reopening
    if (!window.confirm('Are you sure you want to reopen this ticket?')) {
      return;
    }

    try {
      // Use the ticketApi to update the ticket status to 'open'
      const response = await ticketApi.updateTicketStatus(id, 'open');

      if (response.data.status === 'success') {
        // Update the local state
        setTicket(prev => ({
          ...prev,
          status: 'Open'
        }));

        // Send system message to chat
        if (ticket.chatId) {
          const chatId = ticket.chatId._id || ticket.chatId;

          // Use the chatApi to send a system message
          await chatApi.sendMessage(chatId, {
            content: 'Ticket has been reopened by support agent.',
            isSystemMessage: true
          });
        }

        // Show success message
        alert('Ticket has been reopened successfully');
      }
    } catch (err) {
      console.error('Error reopening ticket:', err);
      alert('Failed to reopen ticket. Please try again.');
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
  const isCurrentUserAdmin = ticket && ticket.assignedAdmin &&
    ticket.assignedAdmin._id === user?._id;

  // Get status text and capitalized status
  const statusText = `Order ${ticket.status}`;
  const statusDate = ticket.createdAt ? formatDate(ticket.createdAt) : 'N/A';

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
              messages.map((msg, index) => {
                // Check if message starts with "(System)" to display as system message
                const isSystemStyleMessage = msg.isSystemMessage || 
                  (msg.content && typeof msg.content === 'string' && msg.content.startsWith("(System)"));
                
                return (
                  <div
                    key={index}
                    className={`message ${isSystemStyleMessage
                        ? 'system-message'
                        : getMessageType(msg) === 'outgoing'
                          ? 'current-user-message'
                          : 'other-user-message'
                      }`}
                  >
                    {!isSystemStyleMessage ? (
                      <>
                        <div className="message-avatar">
                          {getMessageType(msg) === 'outgoing'
                            ? (user?.username?.charAt(0).toUpperCase() || 'Y')
                            : (isCurrentUserAdmin
                              ? (ticket.sellerId?.username?.charAt(0).toUpperCase() || 'S')
                              : (ticket.assignedAdmin?.username?.charAt(0).toUpperCase() || 'A'))}
                        </div>
                        <div className="message-content">
                          <div className="message-sender">
                            {getMessageType(msg) === 'outgoing'
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
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="currentColor" />
                          </svg>
                        </div>
                        <p className="system-message-text">
                          {isSystemStyleMessage && msg.content.startsWith("(System)") 
                            ? msg.content.substring(8).trim() // Remove the "(System)" prefix
                            : msg.content}
                        </p>
                        <div className="message-time" title={formatDetailedDate(msg.timestamp)}>
                          {formatDate(msg.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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
              onClick={handleSendMessageClick}
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
