# PlayTrade Frontend API Structure

This document describes the API structure for the PlayTrade frontend application.

## Overview

The API folder structure provides a clean, organized approach to making backend requests. Each controller in the backend has a dedicated API module in the frontend, making it easy to find and maintain API calls.

## Structure

```
/src
  /api
    index.js            - Base API configuration and exports
    userApi.js          - User-related API calls
    orderApi.js         - Order-related API calls
    chatApi.js          - Chat and messaging API calls
    ticketApi.js        - Support tickets API calls
    walletApi.js        - Wallet and transactions API calls
    gameAccountApi.js   - Game account API calls for all game types
```

## Usage

### Import API modules

```javascript
// Import specific API modules
import { userApi, orderApi } from '../api';

// Or import individual module
import userApi from '../api/userApi';
```

### Making API calls

All API modules return promises and follow a consistent pattern:

```javascript
// Example: Get user profile
userApi.getMe()
  .then(response => {
    const userData = response.data.data;
    // Process user data
  })
  .catch(error => {
    // Handle error
  });

// With async/await
async function fetchUserProfile() {
  try {
    const response = await userApi.getMe();
    const userData = response.data.data;
    // Process user data
  } catch (error) {
    // Handle error
  }
}
```

### Working with game accounts

The `gameAccountApi` is organized by game type:

```javascript
// Get Valorant accounts with filters
gameAccountApi.valorant.getAccounts({
  minPrice: 10,
  maxPrice: 500,
  status: 'active'
})
  .then(response => {
    const accounts = response.data.data;
    // Process accounts
  });

// Create a League of Legends account
gameAccountApi.leagueoflegends.createAccount(accountData)
  .then(response => {
    // Handle success
  });
```

## Benefits

1. **Centralized Configuration**: Token handling, error management, and base URL configuration are set up in one place.
2. **Code Reusability**: No duplicate API call logic across components.
3. **Easier Maintenance**: If an API endpoint changes, you only need to update it in one place.
4. **Better Organization**: API calls are grouped by functionality.
5. **Simplified Testing**: API modules can be easily mocked for testing components.

## Example

See `examples/ApiUsageExample.jsx` for a complete example of how to use these API modules in a React component. 