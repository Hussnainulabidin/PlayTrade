import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Paperclip, SmilePlus, ThumbsUp, ThumbsDown, X, AlertTriangle } from 'lucide-react';
import { orderApi } from '../../api';
import useChat from '../../hooks/useChat';
import styles from './OrderDetails.module.css';

function OrderDetails() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [closingDispute, setClosingDispute] = useState(false);
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
        const response = await orderApi.getOrderById(id);

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
      const response = await orderApi.markOrderAsReceived(orderData.id);

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

  const handleCloseDispute = async () => {
    if (!window.confirm("Are you sure you want to close this dispute? This will mark the order as received and complete the transaction.")) {
      return;
    }

    try {
      setClosingDispute(true);

      const response = await orderApi.closeDispute(orderData.id);

      if (response.data.status === 'success') {
        // Update the order status locally to 'completed'
        setOrderData(prev => ({
          ...prev,
          status: 'completed'
        }));

        // Show success message
        alert('Dispute closed successfully. Order marked as received.');
      }
    } catch (err) {
      console.error('Error closing dispute:', err);
      alert(`Failed to close dispute: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setClosingDispute(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      // Ask for confirmation before cancelling
      if (!window.confirm("Are you sure you want to cancel this order? This will:\n- Return the full payment to the customer\n- Change your account status back to active\n- Record the refund in wallet history\n\nThis action cannot be undone.")) {
        return;
      }

      const response = await orderApi.cancelOrder(orderData.id);

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

  const handleDispute = () => {
    // Open the dispute modal instead of using prompt
    setShowDisputeModal(true);
  };

  const handleCloseDisputeModal = () => {
    setShowDisputeModal(false);
    setDisputeReason('');
  };

  const handleSubmitDispute = async () => {
    try {
      setSubmittingDispute(true);

      const response = await orderApi.disputeOrder(orderData.id, disputeReason);

      if (response.data.status === 'success') {
        // Update the local state
        setOrderData(prev => ({
          ...prev,
          status: 'disputed'
        }));

        // Close the modal
        setShowDisputeModal(false);
        setDisputeReason('');

        // Display success message
        alert('Your dispute has been submitted. Our team will review it shortly.');
      }
    } catch (err) {
      console.error('Error submitting dispute:', err);
      alert(`Failed to submit dispute: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleGiveFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackType(null);
    setFeedbackMessage('');
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackType) {
      alert("Please select whether your experience was positive or negative.");
      return;
    }

    try {
      setSubmittingFeedback(true);

      const feedbackData = {
        review: feedbackType.toLowerCase(),
        reviewMessage: feedbackMessage
      };

      const response = await orderApi.submitFeedback(orderData.id, feedbackData);

      if (response.data.status === 'success') {
        // Update local state with feedback
        setOrderData(prev => ({
          ...prev,
          review: feedbackType.toLowerCase(),
          reviewMessage: feedbackMessage
        }));

        // Close the modal
        setShowFeedbackModal(false);
        setFeedbackType(null);
        setFeedbackMessage('');

        // Show success message
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
    return (
      <div className={styles['loader-container']}>
        <div className={styles['loader-wrapper']}>
          <div className={styles['loader-spinner']}>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className={styles['loader-text']}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!orderData) {
    return <div className={styles.error}>Order not found</div>;
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
    <div className={styles['order-container']}>
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className={styles['feedback-modal-overlay']}>
          <div className={styles['feedback-modal']}>
            <div className={styles['feedback-modal-header']}>
              <h3>Leave Your Feedback</h3>
              <button
                className={styles['close-modal-btn']}
                onClick={handleCloseFeedbackModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles['feedback-type-selection']}>
              <p>How was your experience with this order?</p>

              <div className={styles['feedback-options']}>
                <button
                  className={`${styles['feedback-option']} ${styles.positive} ${feedbackType === 'positive' ? styles.selected : ''}`}
                  onClick={() => setFeedbackType('positive')}
                >
                  <ThumbsUp size={24} />
                  <span>Positive</span>
                </button>

                <button
                  className={`${styles['feedback-option']} ${styles.negative} ${feedbackType === 'negative' ? styles.selected : ''}`}
                  onClick={() => setFeedbackType('negative')}
                >
                  <ThumbsDown size={24} />
                  <span>Negative</span>
                </button>
              </div>
            </div>

            <div className={styles['feedback-message']}>
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

            <div className={styles['feedback-actions']}>
              <button
                className={styles['cancel-feedback-btn']}
                onClick={handleCloseFeedbackModal}
              >
                Cancel
              </button>
              <button
                className={styles['submit-feedback-btn']}
                onClick={handleSubmitFeedback}
                disabled={!feedbackType || submittingFeedback}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className={styles['feedback-modal-overlay']}>
          <div className={styles['feedback-modal']}>
            <div className={styles['feedback-modal-header']}>
              <h3>Dispute Order</h3>
              <button
                className={styles['close-modal-btn']}
                onClick={handleCloseDisputeModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles['feedback-type-selection']}>
              <div className={styles['dispute-icon']}>
                <AlertTriangle size={24} color="#faad14" />
              </div>
              <p>Please explain why you're disputing this order. This will help our support team resolve the issue faster.</p>
            </div>

            <div className={styles['feedback-message']}>
              <p>Dispute reason:</p>
              <textarea
                placeholder="Explain your issue (e.g., 'Account credentials don't work', 'Items missing from account', etc.)"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={6}
                required
              />
              <small>Please provide enough details for our team to assist you properly.</small>
            </div>

            <div className={styles['feedback-actions']}>
              <button
                className={styles['cancel-feedback-btn']}
                onClick={handleCloseDisputeModal}
              >
                Cancel
              </button>
              <button
                className={styles['dispute-submit-btn']}
                onClick={handleSubmitDispute}
                disabled={!disputeReason.trim() || submittingDispute}
              >
                {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles['order-wrapper']}>
        <div className={styles['order-main']}>
          {/* Header */}
          <div className={styles['order-header']}>
            <ArrowLeft className={styles['back-icon']} onClick={handleGoBack} />
            <span className={styles['back-text']}>All Orders</span>
          </div>

          <div className={styles['order-content']}>
            {/* Order Tags and ID */}
            <div className={styles['order-summary']}>
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=50&h=50"
                alt="Game Icon"
                className={styles['game-icon']}
              />
              <div className={styles['summary-details']}>
                <div className={styles['item-tags']}>
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
                <div className={styles['order-id']}>
                  Order ID: {orderData.id}
                </div>
              </div>
              <span className={styles['status-badge']}>
                {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
              </span>
            </div>

            {/* Order Details Below Tags */}
            <div className={styles['order-card']}>
              <div className={styles['status-header']}>
                <div className={styles['status-icon']}>
                  <ChevronRight className={styles['chevron-icon']} />
                </div>
                <div>
                  <h2 className={styles['status-title']}>{statusText}</h2>
                  <p className={styles['status-date']}>{statusDate}</p>
                </div>
              </div>

              {/* Account Details Card */}
              <div className={styles['account-details']}>

                <div className={styles['credentials-section']}>
                  <h4 className={styles['credentials-title']}>Account Credentials</h4>

                  <div className={styles['credential-field']}>
                    <div className={styles['credential-label']}>Username</div>
                    <div className={styles['credential-value']}>
                      {orderData.account?.login}
                      <button className={styles['copy-btn']} onClick={() => navigator.clipboard.writeText(orderData.account?.login || '')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className={styles['credential-field']}>
                    <div className={styles['credential-label']}>Password</div>
                    <div className={styles['credential-value']}>
                      <span className={styles['password-mask']} title={orderData.account?.password || ''}>
                        {orderData.account?.password ? '••••••••' : 'N/A'}
                      </span>
                      <button className={styles['copy-btn']} onClick={() => navigator.clipboard.writeText(orderData.account?.password || '')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </div>

                  {orderData.account?.ign && (
                    <div className={styles['credential-field']}>
                      <div className={styles['credential-label']}>IGN</div>
                      <div className={styles['credential-value']}>
                        {orderData.account.ign}
                        <button className={styles['copy-btn']} onClick={() => navigator.clipboard.writeText(orderData.account.ign || '')}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles['credentials-section']}>
                  <h4 className={styles['credentials-title']}>Email Credentials</h4>

                  <div className={styles['credential-field']}>
                    <div className={styles['credential-label']}>Email Login</div>
                    <div className={styles['credential-value']}>
                      {orderData.account?.emailLogin || 'N/A'}
                      <button className={styles['copy-btn']} onClick={() => navigator.clipboard.writeText(orderData.account?.emailLogin || '')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div className={styles['credential-field']}>
                    <div className={styles['credential-label']}>Email Password</div>
                    <div className={styles['credential-value']}>
                      <span className={styles['password-mask']} title={orderData.account?.emailPassword || ''}>
                        {orderData.account?.emailPassword ? '••••••••' : 'N/A'}
                      </span>
                      <button className={styles['copy-btn']} onClick={() => navigator.clipboard.writeText(orderData.account?.emailPassword || '')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      </button>
                    </div>
                  </div>

                  {orderData.account?.twoFactorEnabled && (
                    <div className={styles['credential-field']}>
                      <div className={styles['credential-label']}>2FA</div>
                      <div className={`${styles['credential-value']} ${styles['credential-2fa']}`}>
                        <span className={styles['badge-enabled']}>✓ Enabled</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles['seller-notes']}>
                  {orderData.account?.deliveryInstructions ? (
                    <div className={styles['delivery-instructions']}>
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
                <div className={styles['order-actions']}>
                  {localStorage.getItem('userId') === orderData.seller?.id ? (
                    <button className={styles['cancel-btn']} onClick={handleCancelOrder}>
                      Cancel order
                    </button>
                  ) : (
                    <div className={styles['buyer-actions']}>
                      {orderData.status === 'refunded' || orderData.status === 'completed' ? (
                        // For completed or refunded orders
                        <>
                          {/* Only hide feedback button if feedback exists */}
                          {!orderData.review && (
                            <button className={styles['feedback-btn']} onClick={handleGiveFeedback}>
                              Give Feedback
                            </button>
                          )}

                          {/* Always show dispute button for completed orders, never for refunded */}
                          {orderData.status === 'completed' && (
                            <button className={styles['dispute-btn']} onClick={handleDispute}>
                              <AlertTriangle size={16} />
                              Dispute Order
                            </button>
                          )}
                        </>
                      ) : (
                        // Original code for processing orders
                        <>
                          {orderData.status === 'disputed' ? (
                            <button
                              className={styles['receive-btn']}
                              onClick={handleCloseDispute}
                              disabled={closingDispute}
                            >
                              {closingDispute ? 'Processing...' : 'Close Dispute'}
                            </button>
                          ) : (
                            <button className={styles['receive-btn']} onClick={handleMarkAsReceived}>
                              Mark as Received
                            </button>
                          )}
                          {orderData.status !== 'disputed' && orderData.status !== 'refunded' && (
                            <button className={styles['dispute-btn']} onClick={handleDispute}>
                              <AlertTriangle size={16} />
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
              <div className={`${styles['feedback-display']} ${orderData.review === 'positive' ? styles.positive : styles.negative}`}>
                <div className={styles['feedback-display-header']}>
                  <div className={styles['feedback-icon']}>
                    {orderData.review === 'positive' ? (
                      <ThumbsUp size={20} />
                    ) : (
                      <ThumbsDown size={20} />
                    )}
                  </div>
                  <div className={styles['feedback-title']}>
                    <h3>{orderData.review === 'positive' ? 'Positive Feedback' : 'Negative Feedback'}</h3>
                  </div>
                </div>
                {orderData.reviewMessage && (
                  <div className={styles['feedback-content']}>
                    <p>&ldquo;{orderData.reviewMessage}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Chat Section */}
            <div className={styles['chat-section']}>
              <div className={styles['user-info']}>
                <div className={styles['user-avatar']}>
                  {localStorage.getItem('userId') === orderData?.seller?._id
                    ? (orderData?.buyer?.username?.[0] || 'B')
                    : (orderData?.seller?.username?.[0] || 'S')}
                </div>
                <div className={styles['user-details']}>
                  <p className={styles['user-name']}>
                    {localStorage.getItem('userId') === orderData?.seller?.id
                      ? (orderData?.buyer?.username || 'Buyer')
                      : (orderData?.seller?.username || 'Seller')}
                  </p>
                  <p className={styles['user-type']}>
                    {getUserType()}
                  </p>
                </div>
                <div className={styles['connection-status']}>
                  <span className={isConnected ? `${styles['status-dot']} ${styles.connected}` : `${styles['status-dot']} ${styles.disconnected}`}></span>
                  {isConnected ? 'Connected' : 'Offline'}
                </div>
              </div>

              <div className={styles['chat-messages']}>
                {/* System messages */}
                <div className={`${styles.message} ${styles['system-message']}`}>
                  <p className={styles['message-text']}>Order Created: {orderData?.id}</p>
                </div>
                <div className={`${styles.message} ${styles['system-message']}`}>
                  <p className={styles['message-text']}>Order {orderData?.status}. If you received goods or services, please mark this Order as &quot;Received&quot; and leave feedback.</p>
                </div>

                {/* Actual chat messages */}
                {messages && messages.length > 0 ? (
                  messages.map((msg, index) => {
                    // Check if this is a system message (either by flag or content starts with "(System)")
                    const isSystemMsg = msg.isSystemMessage ||
                      (msg.content && msg.content.startsWith("(System)"));

                    // If it's a system message, display it centered
                    if (isSystemMsg) {
                      // Remove "(System)" prefix if it exists
                      let messageContent = msg.content && msg.content.startsWith("(System)")
                        ? msg.content.substring(8) // Remove "(System)" prefix
                        : msg.content;

                      // Format message with line breaks if it contains "Reason:"
                      if (messageContent.includes("Reason:")) {
                        messageContent = messageContent.replace("Reason:", "\nReason:");
                      }

                      return (
                        <div key={index} className={`${styles.message} ${styles['system-message']}`}>
                          <p className={styles['message-text']}>{messageContent}</p>
                        </div>
                      );
                    }

                    const currentUserId = localStorage.getItem('userId');
                    const isCurrentUser = msg.sender && (
                      (typeof msg.sender === 'object' && msg.sender._id && msg.sender._id.toString() === currentUserId) ||
                      (typeof msg.sender === 'string' && msg.sender.toString() === currentUserId)
                    );
                    const isCurrentUserSeller = currentUserId === orderData?.seller?.id;

                    return (
                      <div
                        key={index}
                        className={`${styles.message} ${isCurrentUser ? styles['current-user-message'] : styles['other-user-message']}`}
                      >
                        <div className={styles['message-avatar']}>
                          {isCurrentUser
                            ? (isCurrentUserSeller
                              ? (orderData?.seller?.username?.[0] || 'S')
                              : (orderData?.buyer?.username?.[0] || 'B'))
                            : (isCurrentUserSeller
                              ? (orderData?.buyer?.username?.[0] || 'B')
                              : (orderData?.seller?.username?.[0] || 'S'))}
                        </div>
                        <div className={styles['message-content']}>
                          <div className={styles['message-sender']}>
                            {isCurrentUser
                              ? (isCurrentUserSeller
                                ? (orderData?.seller?.username || 'Seller')
                                : (orderData?.buyer?.username || 'Buyer'))
                              : (isCurrentUserSeller
                                ? (orderData?.buyer?.username || 'Buyer')
                                : (orderData?.seller?.username || 'Seller'))}
                          </div>
                          <p className={styles['message-text']}>{msg.content}</p>
                          <span className={styles['message-time']}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles['no-messages']}>
                    No messages yet. Start the conversation!
                  </div>
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className={`${styles.message} ${styles['typing-indicator']}`}>
                    <div className={styles.dots}>
                      <span className={styles.dot}></span>
                      <span className={styles.dot}></span>
                      <span className={styles.dot}></span>
                    </div>
                  </div>
                )}

                {/* Reference for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles['chat-input']}>
                <input
                  type="text"
                  placeholder="Say something..."
                  className={styles['input-field']}
                  value={message}
                  onChange={handleMessageChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className={styles['send-btn']} onClick={handleSendMessage}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
                <Paperclip className={styles['input-icon']} />
                <SmilePlus className={styles['input-icon']} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Details */}
        <div className={styles['order-sidebar']}>
          {/* Guaranteed Delivery Time */}
          <div className={styles['sidebar-card']}>
            <h3 className={styles['card-title']}>Guaranteed delivery time</h3>
            <div className={styles['delivery-info']}>
              <span className={styles['delivery-icon']}>⚡</span>
              <span>Instant delivery</span>
            </div>
          </div>

          {/* Order Details */}
          <div className={styles['sidebar-card']}>
            <h3 className={styles['card-title']}>Order details</h3>
            <div className={styles['detail-rows']}>
              {/* Game Details */}
              <div className={styles['detail-row']}>
                <span className={styles['detail-label']}>Game</span>
                <span>{orderData.game}</span>
              </div>
              <div className={styles['detail-row']}>
                <span className={styles['detail-label']}>Device</span>
                <span>💻 PC</span>
              </div>

              {/* Divider */}
              <div className={styles['section-divider']}></div>

              {/* Account Data - Dynamically displayed based on game type */}
              {orderData.account?.accountData && (
                <>
                  {Object.entries(orderData.account.accountData).map(([key, value]) => (
                    <div className={styles['detail-row']} key={key}>
                      <span className={styles['detail-label']}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={styles['detail-value']}>{value}</span>
                    </div>
                  ))}

                  {/* Divider after account data */}
                  <div className={styles['section-divider']}></div>
                </>
              )}

              {/* Buyer/Seller Info */}
              <div className={styles['detail-row']}>
                <span className={styles['detail-label']}>Buyer</span>
                <span>{orderData.buyer?.username || 'Unknown'}</span>
              </div>
              <div className={styles['detail-row']}>
                <span className={styles['detail-label']}>Seller</span>
                <span>{orderData.seller?.username || 'Unknown'}</span>
              </div>


            </div>
            <button className={styles['view-description']}>
              View full description
            </button>
          </div>

          {/* Payment Details - only show to seller */}
          {localStorage.getItem('userId') !== orderData?.buyer?.id && (
            <div className={styles['sidebar-card']}>
              <h3 className={styles['card-title']}>Payment details</h3>
              <div className={styles['detail-rows']}>
                <div className={styles['detail-row']}>
                  <span className={styles['detail-label']}>Order Price</span>
                  <span>${orderData.payment?.orderPrice.toFixed(2)}</span>
                </div>
                <div className={styles['detail-row']}>
                  <span className={styles['detail-label']}>Commission</span>
                  <span className={styles['commission-amount']}>-${orderData.payment?.commission?.amount}</span>
                </div>
                <div className={styles['detail-row']}>
                  <span className={styles['detail-label']}>You receive</span>
                  <span>${orderData.payment?.sellerReceives}</span>
                </div>
              </div>
              <p className={styles['info-text']}>
                Funds will be automatically added to your balance after 1 day.
              </p>
              <p className={`${styles['info-text']} ${styles['margin-top']}`}>
                If the buyer confirms delivery, funds will be added to your balance immediately.
              </p>
              <div className={styles['help-box']}>
                <p className={styles['help-text']}>
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