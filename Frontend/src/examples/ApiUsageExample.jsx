import React, { useState, useEffect } from 'react';
import { userApi, orderApi, gameAccountApi } from '../api';

// Example component showing how to use the API modules
const ApiUsageExample = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [valorantAccounts, setValorantAccounts] = useState([]);
  const [loading, setLoading] = useState({
    user: false,
    orders: false,
    accounts: false
  });
  const [error, setError] = useState({
    user: null,
    orders: null,
    accounts: null
  });

  // Example: Fetch user profile
  const fetchUserProfile = async () => {
    setLoading(prev => ({ ...prev, user: true }));
    try {
      const response = await userApi.getMe();
      setUser(response.data.data);
      setError(prev => ({ ...prev, user: null }));
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(prev => ({ ...prev, user: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  };

  // Example: Fetch user's orders
  const fetchOrders = async () => {
    setLoading(prev => ({ ...prev, orders: true }));
    try {
      const response = await orderApi.getMyOrders();
      setOrders(response.data.data);
      setError(prev => ({ ...prev, orders: null }));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(prev => ({ ...prev, orders: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  // Example: Fetch Valorant accounts with filters
  const fetchValorantAccounts = async () => {
    setLoading(prev => ({ ...prev, accounts: true }));
    try {
      const filters = {
        minPrice: 10,
        maxPrice: 500,
        status: 'active',
        sortBy: 'price'
      };
      
      const response = await gameAccountApi.valorant.getAccounts(filters);
      setValorantAccounts(response.data.data);
      setError(prev => ({ ...prev, accounts: null }));
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(prev => ({ ...prev, accounts: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, accounts: false }));
    }
  };

  // Example: Update notification preferences
  const updateNotificationPreferences = async () => {
    try {
      const preferences = {
        newOrder: true,
        messages: true,
        paymentUpdates: false,
        disputes: true,
        withdrawals: true
      };
      
      await userApi.updateNotificationPreferences(preferences);
      // Refresh user data after update
      fetchUserProfile();
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
    fetchValorantAccounts();
  }, []);

  return (
    <div className="api-example p-4">
      <h1 className="text-xl font-bold mb-4">API Usage Example</h1>
      
      {/* User Profile Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">User Profile</h2>
        {loading.user ? (
          <p>Loading user profile...</p>
        ) : error.user ? (
          <p className="text-red-500">Error: {error.user}</p>
        ) : user ? (
          <div>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <button 
              onClick={updateNotificationPreferences}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Update Notification Preferences
            </button>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </section>
      
      {/* Orders Section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">My Orders</h2>
        {loading.orders ? (
          <p>Loading orders...</p>
        ) : error.orders ? (
          <p className="text-red-500">Error: {error.orders}</p>
        ) : orders.length > 0 ? (
          <ul>
            {orders.map(order => (
              <li key={order.id} className="mb-2">
                <p>Order ID: {order.id}</p>
                <p>Game: {order.gameType}</p>
                <p>Status: {order.status}</p>
                <p>Amount: {order.amount}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No orders found</p>
        )}
      </section>
      
      {/* Accounts Section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Valorant Accounts</h2>
        {loading.accounts ? (
          <p>Loading accounts...</p>
        ) : error.accounts ? (
          <p className="text-red-500">Error: {error.accounts}</p>
        ) : valorantAccounts.length > 0 ? (
          <ul>
            {valorantAccounts.map(account => (
              <li key={account._id} className="mb-2">
                <p>Title: {account.title}</p>
                <p>Price: ${account.price}</p>
                <p>Server: {account.server}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No accounts found</p>
        )}
      </section>
    </div>
  );
};

export default ApiUsageExample; 