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

  uploadPictures: (accountId, formData, gameType) => {
    // Handle undefined or empty gameType
    if (!gameType) {
      console.error('Game type is undefined in uploadPictures. Please provide a valid game type.');
      console.error('Stack trace:', new Error().stack);
      return Promise.reject(new Error('Invalid game type'));
    }

    const endpoint = gameType === 'valorant'
      ? `/valorant/accounts/${accountId}/pictures`
      : `/${gameType}/accounts/${accountId}/pictures`;

    console.log('Uploading to endpoint:', endpoint);

    return API.put(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  updateStatus: (accountId, gameType, status) =>
    API.patch(`/gameAccounts/update-status/`, { accountId, gameType, status }),

  getSellerAccounts: (sellerId, page = 1, limit = 10) =>
    API.get(`/gameAccounts/seller/${sellerId}?page=${page}&limit=${limit}`),
};

// Game-specific account APIs
const gameAccountApi = {
  // Common methods at top level for direct access
  updateStatus: commonAccountMethods.updateStatus,
  getSellerAccounts: commonAccountMethods.getSellerAccounts,
  deleteAccount: (accountId, gameType) =>
    API.delete(`/gameAccounts/delete-account`, { data: { accountId, gameType } }),

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

    // Endpoint matches router.post("/", ...) in valorantRoutes.js
    createAccount: (accountData) => API.post('/valorant', accountData),

    uploadPictures: (accountId, formData) => {
      // Use the common method but explicitly pass 'valorant' as the game type
      return commonAccountMethods.uploadPictures(accountId, formData, 'valorant');
    },

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

    // Endpoint should match router.post("/", ...) in fortniteRoutes.js
    createAccount: (accountData) => API.post('/fortnite', accountData),

    uploadPictures: (accountId, formData) => {
      // Use the common method but explicitly pass 'fortnite' as the game type
      return commonAccountMethods.uploadPictures(accountId, formData, 'fortnite');
    },

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

    // Endpoint should match router.post("/", ...) in leagueoflegendsRoutes.js
    createAccount: (accountData) => API.post('/leagueoflegends', accountData),

    uploadPictures: (accountId, formData) => {
      // Use the common method but explicitly pass 'leagueoflegends' as the game type
      return commonAccountMethods.uploadPictures(accountId, formData, 'leagueoflegends');
    },

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

    // Endpoint should match router.post("/", ...) in brawlstarsRoutes.js
    createAccount: (accountData) => API.post('/brawlstars', accountData),

    uploadPictures: (accountId, formData) => {
      // Use the common method but explicitly pass 'brawlstars' as the game type
      return commonAccountMethods.uploadPictures(accountId, formData, 'brawlstars');
    },

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

    // Endpoint should match router.post("/", ...) in clashofclansRoutes.js
    createAccount: (accountData) => API.post('/clashofclans', accountData),

    uploadPictures: (accountId, formData) => {
      // Use the common method but explicitly pass 'clashofclans' as the game type
      return commonAccountMethods.uploadPictures(accountId, formData, 'clashofclans');
    },

    ...commonAccountMethods
  },
};

export default gameAccountApi; 