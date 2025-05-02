import API from './index';

const orderApi = {
  // Get orders
  getMyOrders: () => API.get('/orders/my-orders'),
  getAllOrders: () => API.get('/orders'),
  getOrdersBySellerId: (sellerId, page = 1, limit = 12) =>
    API.get(`/orders/seller/${sellerId}?page=${page}&limit=${limit}`),
  getOrderById: (id) => API.get(`/orders/myorder/${id}`),
  getOrderByAccountId: (accountId) => API.get(`/orders/account/${accountId}`),

  // Order actions
  createOrder: (orderData) => API.post('/orders', orderData),
  markOrderAsReceived: (id) => API.post(`/orders/${id}/mark-received`),
  submitFeedback: (id, feedbackData) => API.post(`/orders/${id}/feedback`, feedbackData),

  // Seller statistics
  getSellerStats: (sellerId) => API.get(`/orders/seller/${sellerId}/stats`),

  // Disputes
  disputeOrder: (id, disputeReason) => API.post(`/orders/${id}/dispute`, { disputeReason }),
  closeDispute: (id) => API.post(`/orders/${id}/close-dispute`),
  getDisputedOrders: (page = 1, limit = 12) => API.get(`/orders/disputed?page=${page}&limit=${limit}`),
  resolveDispute: (id, resolution) => API.post(`/orders/${id}/resolve-dispute`, { resolution }),

  // Refunds and cancellations
  refundOrder: (id) => API.post(`/orders/${id}/refund`),
  cancelOrder: (id) => API.post(`/orders/${id}/cancel`),

  // Chat creation for orders
  createChatForOrder: (id) => API.post(`/orders/${id}/create-chat`),
};

export default orderApi; 