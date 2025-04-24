import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Paperclip, SmilePlus, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import axios from 'axios';
import useChat from '../hooks/useChat';
import './OrderDetails.css';

function OrderDetails() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use the chat hook
  const {
    messages,
    isConnected,
    isTyping,
    sendMessage,
    handleTyping,
    messagesEndRef,
  } = useChat(orderData);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3003/orders/myorder/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.status === 'success') {
          setOrderData(response.data.data);
        } else {
          setError('Failed to fetch order detail');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleMessageChange = (event) => {
    const text = event.target.value;
    setMessage(text);
    handleTyping(text.length > 0);
  };
  
  const handleSendMessage = async () => {
    const success = await sendMessage(message);
    if (success) {
      setMessage('');
      handleTyping(false);
    }
  };
  
  const getUserType = () => {
    const userId = localStorage.getItem('userId');
    if (userId === orderData.seller?._id) {
      return 'Buyer';
    } else {
      return 'Seller';
    }
  };

  const handleMarkAsReceived = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3003/orders/${orderData.id}/mark-received`,
        {
          sendChatMessage: false // Do not send any system message to the chat
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the order status locally to 'completed'
        setOrderData(prev => ({
          ...prev,
          status: 'completed'
        }));
        
        // Show success message
        alert('Order marked as received successfully! Please leave your feedback.');
      }
    } catch (err) {
      console.error('Error marking order as received:', err);
      alert('Failed to mark order as received. Please try again.');
    }
  };

  const handleCancelOrder = async () => {
    try {
      // Ask for confirmation before cancelling
      if (!window.confirm("Are you sure you want to cancel this order? This will:\n- Return the full payment to the customer\n- Change your account status back to active\n- Record the refund in wallet history\n\nThis action cannot be undone.")) {
        return;
      }
      
      const response = await axios.post(
        `http://localhost:3003/orders/${orderData.id}/refund`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the local state
        setOrderData(prev => ({
          ...prev,
          status: 'refunded'
        }));
        
        // Display success message
        alert('Order has been cancelled successfully. The buyer has been refunded.');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(`Failed to cancel order: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleDispute = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3003/orders/${orderData.id}/dispute`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update the order status locally
        setOrderData(prev => ({
          ...prev,
          status: 'disputed'
        }));
      }
    } catch (err) {
      console.error('Error disputing order:', err);
      alert('Failed to dispute order. Please try again.');
    }
  };

  const handleGiveFeedback = () => {
    // Open the feedback modal instead of navigating
    setShowFeedbackModal(true);
  };
  
  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackType(null);
    setFeedbackMessage('');
  };
  
  const handleSubmitFeedback = async () => {
    // Validate input
    if (!feedbackType) {
      alert('Please select a feedback type (Positive or Negative)');
      return;
    }
    
    try {
      setSubmittingFeedback(true);
      
      const response = await axios.post(
        `http://localhost:3003/orders/${orderData.id}/feedback`,
        {
          review: feedbackType,
          reviewMessage: feedbackMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        // Update local order data with the feedback
        setOrderData(prev => ({
          ...prev,
          review: feedbackType,
          reviewMessage: feedbackMessage
        }));
        
        // Close the modal and show success message
        setShowFeedbackModal(false);
        alert('Thank you for your feedback!');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert(`Failed to submit feedback: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!orderData) {
    return <div className="error">Order not found</div>;
  }
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };
  
  // Get status text and capitalized status
  const statusText = `Order ${orderData.status}`;
  const statusDate = orderData.createdAt ? formatDate(orderData.createdAt) : 'N/A';

  console.log(orderData);
  

  return (
    <div className="order-container">
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="feedback-modal-header">
              <h3>Leave Your Feedback</h3>
              <button 
                className="close-modal-btn" 
                onClick={handleCloseFeedbackModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="feedback-type-selection">
              <p>How was your experience with this order?</p>
              
              <div className="feedback-options">
                <button 
                  className={`feedback-option positive ${feedbackType === 'positive' ? 'selected' : ''}`}
                  onClick={() => setFeedbackType('positive')}
                >
                  <ThumbsUp size={24} />
                  <span>Positive</span>
                </button>
                
                <button 
                  className={`feedback-option negative ${feedbackType === 'negative' ? 'selected' : ''}`}
                  onClick={() => setFeedbackType('negative')}
                >
                  <ThumbsDown size={24} />
                  <span>Negative</span>
                </button>
              </div>
            </div>
            
            <div className="feedback-message">
              <p>Additional comments (optional):</p>
              <textarea
                placeholder="Share your experience..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                maxLength={100}
                rows={4}
              />
              <small>{feedbackMessage.length}/100 characters</small>
            </div>
            
            <div className="feedback-actions">
              <button 
                className="cancel-feedback-btn"
                onClick={handleCloseFeedbackModal}
              >
                Cancel
              </button>
              <button 
                className="submit-feedback-btn"
                onClick={handleSubmitFeedback}
                disabled={!feedbackType || submittingFeedback}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="order-wrapper">
        <div className="order-main">
          {/* Header */}
          <div className="order-header">
            <ArrowLeft className="back-icon" onClick={handleGoBack} />
            <span className="back-text">All Orders</span>
          </div>

          <div className="order-content">
            {/* Order Tags and ID */}
            <div className="order-summary">
              <img 
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=50&h=50" 
                alt="Game Icon" 
                className="game-icon"
              />
              <div className="summary-details">
                <div className="item-tags">
                  {orderData.account?.title && (
                    <>
                      {orderData.account.title.length > 50 ? (
                        (() => {
                          const breakPoint = orderData.account.title.substring(0, 60).lastIndexOf(' ');
                          const firstPart = orderData.account.title.substring(0, breakPoint);
                          const secondPart = orderData.account.title.substring(breakPoint + 1);
                          return (
                            <>
                              <span>{firstPart}</span>
                              <span>{secondPart}</span>
                            </>
                          );
                        })()
                      ) : (
                        <span>📝 {orderData.account.title}</span>
                      )}
                    </>
                  )}
                </div>
                <div className="order-id">
                  Order ID: {orderData.id}
                </div>
              </div>
              <span className="status-badge">
                {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
              </span>
            </div>

            {/* Order Details Below Tags */}
            <div className="order-card">
                <div className="status-header">
                  <div className="status-icon">
                    <ChevronRight className="chevron-icon" />
                  </div>
                  <div>
                    <h2 className="status-title">{statusText}</h2>
                    <p className="status-date">{statusDate}</p>
                  </div>
                </div>

                {/* Account Details Card */}
                <div className="account-details">
                  
                  <div className="credentials-section">
                    <h4 className="credentials-title">Account Credentials</h4>
                    
                    <div className="credential-field">
                      <div className="credential-label">Username</div>
                      <div className="credential-value">
                        {orderData.account?.login} 
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(orderData.account?.login || '')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="credential-field">
                      <div className="credential-label">Password</div>
                      <div className="credential-value">
                        <span className="password-mask" title={orderData.account?.password || ''}>
                          {orderData.account?.password ? '••••••••' : 'N/A'}
                        </span>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(orderData.account?.password || '')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                    
                    {orderData.account?.ign && (
                      <div className="credential-field">
                        <div className="credential-label">IGN</div>
                        <div className="credential-value">
                          {orderData.account.ign}
                          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(orderData.account.ign || '')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="credentials-section">
                    <h4 className="credentials-title">Email Credentials</h4>
                    
                    <div className="credential-field">
                      <div className="credential-label">Email Login</div>
                      <div className="credential-value">
                        {orderData.account?.emailLogin || 'N/A'}
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(orderData.account?.emailLogin || '')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="credential-field">
                      <div className="credential-label">Email Password</div>
                      <div className="credential-value">
                        <span className="password-mask" title={orderData.account?.emailPassword || ''}>
                          {orderData.account?.emailPassword ? '••••••••' : 'N/A'}
                        </span>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(orderData.account?.emailPassword || '')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                    
                    {orderData.account?.twoFactorEnabled && (
                      <div className="credential-field">
                        <div className="credential-label">2FA</div>
                        <div className="credential-value credential-2fa">
                          <span className="badge-enabled">✓ Enabled</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="seller-notes">
                    {orderData.account?.deliveryInstructions ? (
                      <div className="delivery-instructions">
                        <h4>Delivery Instructions:</h4>
                        <p>{orderData.account.deliveryInstructions}</p>
                      </div>
                    ) : (
                      <p>No specific delivery instructions provided.</p>
                    )}
                  </div>
                </div>

                {/* Order action buttons */}
                {orderData.status !== 'cancelled' && (
                  <div className="order-actions">
                    {localStorage.getItem('userId') === orderData.seller?.id ? (
                      <button className="cancel-btn" onClick={handleCancelOrder}>
                        Cancel order
                      </button>
                    ) : (
                      <div className="buyer-actions">
                        {orderData.status === 'refunded' || orderData.status === 'completed' ? (
                          // For completed or refunded orders
                          <>
                            {/* Only hide feedback button if feedback exists */}
                            {!orderData.review && (
                          <button className="feedback-btn" onClick={handleGiveFeedback}>
                            Give Feedback
                          </button>
                            )}
                            
                            {/* Always show dispute button for completed orders, never for refunded */}
                            {orderData.status === 'completed' && (
                              <button className="dispute-btn" onClick={handleDispute}>
                                Dispute Order
                              </button>
                            )}
                          </>
                        ) : (
                          // Original code for processing orders
                          <>
                            <button className="receive-btn" onClick={handleMarkAsReceived}>
                              Mark as Received
                            </button>
                            {orderData.status !== 'disputed' && orderData.status !== 'refunded' && (
                              <button className="dispute-btn" onClick={handleDispute}>
                                Dispute Order
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Display feedback if it exists */}
            {orderData.review && (
              <div className={`feedback-display ${orderData.review === 'positive' ? 'positive' : 'negative'}`}>
                <div className="feedback-display-header">
                  <div className="feedback-icon">
                    {orderData.review === 'positive' ? (
                      <ThumbsUp size={20} />
                    ) : (
                      <ThumbsDown size={20} />
                    )}
                  </div>
                  <div className="feedback-title">
                    <h3>{orderData.review === 'positive' ? 'Positive Feedback' : 'Negative Feedback'}</h3>
                  </div>
                </div>
                {orderData.reviewMessage && (
                  <div className="feedback-content">
                    <p>&ldquo;{orderData.reviewMessage}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Chat Section */}
            <div className="chat-section">
              <div className="user-info">
                <div className="user-avatar">
                  {localStorage.getItem('userId') === orderData?.seller?._id
                    ? (orderData?.buyer?.username?.[0] || 'B')
                    : (orderData?.seller?.username?.[0] || 'S')}
                </div>
                <div className="user-details">
                  <p className="user-name">
                    {localStorage.getItem('userId') === orderData?.seller?.id
                      ? (orderData?.buyer?.username || 'Buyer')
                      : (orderData?.seller?.username || 'Seller')}
                  </p>
                  <p className="user-type">
                    {getUserType()}
                  </p>
                </div>
                <div className="connection-status">
                  <span className={isConnected ? "status-dot connected" : "status-dot disconnected"}></span>
                  {isConnected ? 'Connected' : 'Offline'}
                </div>
              </div>

              <div className="chat-messages">
                {/* System messages */}
                <div className="message system-message">
                  <p className="message-text">Order Created: {orderData?.id}</p>
                </div>
                <div className="message system-message">
                  <p className="message-text">Order {orderData?.status}. If you received goods or services, please mark this Order as &quot;Received&quot; and leave feedback.</p>
                </div>
                
                {/* Actual chat messages */}
                {messages && messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const currentUserId = localStorage.getItem('userId');
                    const isCurrentUser = msg.sender && (
                      (typeof msg.sender === 'object' && msg.sender._id && msg.sender._id.toString() === currentUserId) ||
                      (typeof msg.sender === 'string' && msg.sender.toString() === currentUserId)
                    );
                    const isCurrentUserSeller = currentUserId === orderData?.seller?.id;
                    
                    return (
                      <div 
                        key={index} 
                        className={`message ${isCurrentUser ? 'current-user-message' : 'other-user-message'}`}
                      >
                        <div className="message-avatar">
                          {isCurrentUser
                            ? (isCurrentUserSeller 
                                ? (orderData?.seller?.username?.[0] || 'S')
                                : (orderData?.buyer?.username?.[0] || 'B'))
                            : (isCurrentUserSeller
                                ? (orderData?.buyer?.username?.[0] || 'B')
                                : (orderData?.seller?.username?.[0] || 'S'))}
                        </div>
                        <div className="message-content">
                          <div className="message-sender">
                            {isCurrentUser
                              ? (isCurrentUserSeller 
                                  ? (orderData?.seller?.username || 'Seller')
                                  : (orderData?.buyer?.username || 'Buyer'))
                              : (isCurrentUserSeller
                                  ? (orderData?.buyer?.username || 'Buyer')
                                  : (orderData?.seller?.username || 'Seller'))}
                          </div>
                          <p className="message-text">{msg.content}</p>
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-messages">
                    No messages yet. Start the conversation!
                  </div>
                )}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="message typing-indicator">
                    <div className="dots">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                )}
                
                {/* Reference for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Say something..."
                  className="input-field"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
                <Paperclip className="input-icon" />
                <SmilePlus className="input-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Details */}
        <div className="order-sidebar">
          {/* Guaranteed Delivery Time */}
          <div className="sidebar-card">
            <h3 className="card-title">Guaranteed delivery time</h3>
            <div className="delivery-info">
              <span className="delivery-icon">⚡</span>
              <span>Instant delivery</span>
            </div>
          </div>

          {/* Order Details */}
          <div className="sidebar-card">
            <h3 className="card-title">Order details</h3>
            <div className="detail-rows">
              {/* Game Details */}
              <div className="detail-row">
                <span className="detail-label">Game</span>
                <span>{orderData.game}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Device</span>
                <span>💻 PC</span>
              </div>

              {/* Divider */}
              <div className="section-divider"></div>

              {/* Account Data - Dynamically displayed based on game type */}
              {orderData.account?.accountData && (
                <>
                  <h4 className="account-data-title">Account Details</h4>
                  {Object.entries(orderData.account.accountData).map(([key, value]) => (
                    <div className="detail-row" key={key}>
                      <span className="detail-label">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="detail-value">{value}</span>
                    </div>
                  ))}
                  
                  {/* Divider after account data */}
                  <div className="section-divider"></div>
                </>
              )}
              
              {/* Buyer/Seller Info */}
              <div className="detail-row">
                <span className="detail-label">Buyer</span>
                <span>{orderData.buyer?.username || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Seller</span>
                <span>{orderData.seller?.username || 'Unknown'}</span>
              </div>

              
            </div>
            <button className="view-description">
              View full description
            </button>
          </div>

          {/* Payment Details - only show to seller */}
          {localStorage.getItem('userId') !== orderData?.buyer?.id && (
          <div className="sidebar-card">
            <h3 className="card-title">Payment details</h3>
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-label">Order Price</span>
                <span>${orderData.payment?.orderPrice.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Commission</span>
                <span className="commission-amount">-${orderData.payment?.commission?.amount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">You receive</span>
                <span>${orderData.payment?.sellerReceives}</span>
              </div>
            </div>
            <p className="info-text">
              Funds will be automatically added to your balance after 1 day.
            </p>
            <p className="info-text margin-top">
              If the buyer confirms delivery, funds will be added to your balance immediately.
            </p>
            <div className="help-box">
              <p className="help-text">
                Learn more in our FAQ.
                <br />
                Chat with PlayTrade Support, we&apos;re available 24/7.
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;