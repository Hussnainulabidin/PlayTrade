import API from './index';

// Common account functions shared across game types
const commonAccountMethods = {
  updateAccount: (id, accountData, gameType) => {
    const endpoint = gameType === 'valorant'
      ? `/valorant/accounts/${id}`
      : `/${gameType}/accounts/${id}`;
    return API.patch(endpoint, accountData);
  },

  deleteAccount: (id, gameType) => {
    const endpoint = gameType === 'valorant'
      ? `/valorant/accounts/${id}`
      : `/${gameType}/accounts/${id}`;
    return API.delete(endpoint);
  },

  uploadImage: (accountId, imageFile, imageType, gameType) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const endpoint = gameType === 'valorant'
      ? `/valorant/accounts/${accountId}/${imageType}-image`
      : `/${gameType}/accounts/${accountId}/${imageType}-image`;

    return API.put(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  updateStatus: (accountId, status) =>
    API.patch(`/gameAccounts/update-status/`, { accountId, status }),

  getSellerAccounts: (sellerId, page = 1, limit = 10) =>
    API.get(`/gameAccounts/seller/${sellerId}?page=${page}&limit=${limit}`),
};

// Game-specific account APIs
const gameAccountApi = {
  // Common methods at top level for direct access
  updateStatus: commonAccountMethods.updateStatus,
  getSellerAccounts: commonAccountMethods.getSellerAccounts,

  // Valorant accounts
  valorant: {
    getAccounts: (filters = {}) => {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      return API.get(`/valorant/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    createAccount: (accountData) => API.post('/valorant/accounts', accountData),

    ...commonAccountMethods
  },

  // Fortnite accounts
  fortnite: {
    getAccounts: (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      return API.get(`/fortnite/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    createAccount: (accountData) => API.post('/fortnite/accounts', accountData),

    ...commonAccountMethods
  },

  // League of Legends accounts
  leagueoflegends: {
    getAccounts: (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      return API.get(`/leagueoflegends/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    createAccount: (accountData) => API.post('/leagueoflegends/accounts', accountData),

    ...commonAccountMethods
  },

  // Brawl Stars accounts
  brawlstars: {
    getAccounts: (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      return API.get(`/brawlstars/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    createAccount: (accountData) => API.post('/brawlstars/accounts', accountData),

    ...commonAccountMethods
  },

  // Clash of Clans accounts
  clashofclans: {
    getAccounts: (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      return API.get(`/clashofclans/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },

    createAccount: (accountData) => API.post('/clashofclans/accounts', accountData),

    ...commonAccountMethods
  },
};

export default gameAccountApi; 