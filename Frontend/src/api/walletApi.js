import API from './index';

const walletApi = {
  // Wallet management
  getWalletBalance: () => API.get('/wallet/balance'),
  getTransactions: (page = 1, limit = 10) => API.get(`/wallet/transactions?page=${page}&limit=${limit}`),

  // Admin functions
  getSellerWallet: (sellerId) => API.get(`/wallet/seller/${sellerId}`),
  getSellerTransactions: (sellerId, page = 1, limit = 10) =>
    API.get(`/wallet/history/${sellerId}`),
  //API.get(`/wallet/history/${sellerId}/transactions?page=${page}&limit=${limit}`),

  // Transactions
  withdraw: (amount, sellerId, message) => API.post(`/wallet/debit/${sellerId}`, { amount, message }),
  deposit: (amount, sellerId, message) => API.post(`/wallet/credit/${sellerId}`, { amount, message }),

  // Admin actions
  approveWithdrawal: (transactionId) => API.post(`/wallet/approve-withdrawal/${transactionId}`),
  denyWithdrawal: (transactionId, reason) => API.post(`/wallet/deny-withdrawal/${transactionId}`, { reason }),
};

export default walletApi; 