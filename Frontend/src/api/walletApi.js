import API from './index';

const walletApi = {
  // Wallet management
  getWalletBalance: () => API.get('/wallet/balance'),
  getTransactions: (page = 1, limit = 10) => API.get(`/wallet/transactions?page=${page}&limit=${limit}`),
  
  // Admin functions
  getSellerWallet: (sellerId) => API.get(`/wallet/seller/${sellerId}`),
  getSellerTransactions: (sellerId, page = 1, limit = 10) => 
    API.get(`/wallet/seller/${sellerId}/transactions?page=${page}&limit=${limit}`),
  
  // Transactions
  withdraw: (amount) => API.post('/wallet/withdraw', { amount }),
  deposit: (amount) => API.post('/wallet/deposit', { amount }),
  
  // Admin actions
  approveWithdrawal: (transactionId) => API.post(`/wallet/approve-withdrawal/${transactionId}`),
  denyWithdrawal: (transactionId, reason) => API.post(`/wallet/deny-withdrawal/${transactionId}`, { reason }),
};

export default walletApi; 