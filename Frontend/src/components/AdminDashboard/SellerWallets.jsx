"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowUpRight, ArrowDownRight, Search, Plus, Minus } from "lucide-react"
import PropTypes from "prop-types"
import { userApi, walletApi } from "../../api"
import "./SellerWallets.css"
import { formatDate } from "../../lib/utils"

export function SellerWallet({ sellerId }) {
  const params = useParams();
  const id = sellerId || params.id;
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false)
  const [showRemoveFundsDialog, setShowRemoveFundsDialog] = useState(false)
  const [addAmount, setAddAmount] = useState("")
  const [addReason, setAddReason] = useState("")
  const [removeAmount, setRemoveAmount] = useState("")
  const [removeReason, setRemoveReason] = useState("")
  
  // State for API data
  const [walletData, setWalletData] = useState({
    balance: "€0.00",
    transactions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true)
        
        // Get user info for balance
        const userResponse = await userApi.getSellerById(id);
        
        // Get wallet transactions
        const transactionsResponse = await walletApi.getSellerTransactions(id, 1, 50);
        
        if (userResponse.data.status === 'success' && transactionsResponse.data.status === 'success') {
          const userData = userResponse.data.data;
          const transactionsData = transactionsResponse.data.data.transactions;
          
          // Format transactions to match our UI
          const formattedTransactions = transactionsData.map(transaction => ({
            id: transaction._id,
            type: transaction.type === "deposit" ? "Credit" : "Debit",
            amount: transaction.type === "deposit" 
              ? `+€${transaction.amount.toFixed(2)}` 
              : `-€${transaction.amount.toFixed(2)}`,
            reason: transaction.message,
            date: transaction.createdAt
          }));
          
          setWalletData({
            balance: `€${userData.walletBalance || userData.wallet || 0}`,
            transactions: formattedTransactions
          });
        }
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to fetch wallet data. Using demo data instead.");
        
        // Fallback to demo data if API fails
        setWalletData({
          balance: "€0.00",
          transactions: [
            {
              id: "demo1",
              type: "Credit",
              amount: "+€100.00",
              reason: "Demo transaction",
              date: new Date().toISOString()
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [id]);

  const filteredTransactions = walletData.transactions.filter(
    (transaction) =>
      transaction.id.includes(searchQuery) || 
      transaction.reason.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddFunds = async () => {
    try {
      const response = await walletApi.deposit({
        userId: id,
        amount: parseFloat(addAmount),
        message: addReason || "Funds added by admin"
      });
      
      if (response.data.status === 'success') {
        alert(`Added €${addAmount} to wallet successfully`);
        // Reload wallet data
        window.location.reload();
      }
    } catch (err) {
      console.error("Error adding funds:", err);
      alert(`Failed to add funds: ${err.response?.data?.message || err.message}`);
    }
    
    setAddAmount("");
    setAddReason("");
    setShowAddFundsDialog(false);
  }

  const handleRemoveFunds = async () => {
    try {
      const response = await walletApi.withdraw({
        userId: id,
        amount: parseFloat(removeAmount),
        message: removeReason || "Funds removed by admin"
      });
      
      if (response.data.status === 'success') {
        alert(`Removed €${removeAmount} from wallet successfully`);
        // Reload wallet data
        window.location.reload();
      }
    } catch (err) {
      console.error("Error removing funds:", err);
      alert(`Failed to remove funds: ${err.response?.data?.message || err.message}`);
    }
    
    setRemoveAmount("");
    setRemoveReason("");
    setShowRemoveFundsDialog(false);
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <Link to={`/admindashboard/sellers/${id}`} className="back-button">
          Back to Seller
        </Link>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader-spinner"></div>
          <div className="loader-text">Loading wallet data...</div>
        </div>
      ) : (
        <>
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <div className="wallet-cards">
            {/* Balance Card */}
            <div className="wallet-card">
              <div className="card-content">
                <h2 className="card-title">Wallet Balance</h2>
                <p className="card-description">Current available funds</p>
                <p className="wallet-balance">{walletData.balance}</p>
              </div>
            </div>

            {/* Add Funds Card */}
            <div className="wallet-card">
              <div className="card-content">
                <h2 className="card-title">Add Funds</h2>
                <p className="card-description">Credit the seller&apos;s wallet</p>
                <button className="add-funds-button" onClick={() => setShowAddFundsDialog(true)}>
                  <Plus size={18} /> Add Funds
                </button>
              </div>
            </div>

            {/* Remove Funds Card */}
            <div className="wallet-card">
              <div className="card-content">
                <h2 className="card-title">Remove Funds</h2>
                <p className="card-description">Debit the seller&apos;s wallet</p>
                <button className="remove-funds-button" onClick={() => setShowRemoveFundsDialog(true)}>
                  <Minus size={18} /> Remove Funds
                </button>
              </div>
            </div>
          </div>

          {/* Search and Transactions */}
          <div className="transactions-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="transactions-table">
              {filteredTransactions.length === 0 ? (
                <div className="no-transactions-message">
                  No transactions found.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>TRANSACTION ID</th>
                      <th>TYPE</th>
                      <th>AMOUNT</th>
                      <th>REASON</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="transaction-id">#{transaction.id}</td>
                        <td>
                          <div className="transaction-type">
                            {transaction.type === "Credit" ? (
                              <ArrowUpRight className="credit-icon" />
                            ) : (
                              <ArrowDownRight className="debit-icon" />
                            )}
                            <span className={`type-badge ${transaction.type === "Credit" ? "credit-badge" : "debit-badge"}`}>
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className={`transaction-amount ${transaction.type === "Credit" ? "credit-amount" : "debit-amount"}`}>
                          {transaction.amount}
                        </td>
                        <td>{transaction.reason}</td>
                        <td>{formatDate(transaction.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Funds Dialog */}
      {showAddFundsDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddFundsDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Add Funds to Wallet</h2>
              <p>Enter the amount and reason for adding funds.</p>
              <button className="dialog-close" onClick={() => setShowAddFundsDialog(false)}>×</button>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label htmlFor="add-amount">Amount (€)</label>
                <input
                  id="add-amount"
                  type="number"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="add-reason">Reason</label>
                <textarea
                  id="add-reason"
                  placeholder="Enter reason for adding funds"
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="cancel-button" onClick={() => setShowAddFundsDialog(false)}>Cancel</button>
              <button className="confirm-button add-button" onClick={handleAddFunds}>Add Funds</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Funds Dialog */}
      {showRemoveFundsDialog && (
        <div className="dialog-overlay" onClick={() => setShowRemoveFundsDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Remove Funds from Wallet</h2>
              <p>Enter the amount and reason for removing funds.</p>
              <button className="dialog-close" onClick={() => setShowRemoveFundsDialog(false)}>×</button>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label htmlFor="remove-amount">Amount (€)</label>
                <input
                  id="remove-amount"
                  type="number"
                  placeholder="0.00"
                  value={removeAmount}
                  onChange={(e) => setRemoveAmount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="remove-reason">Reason</label>
                <textarea
                  id="remove-reason"
                  placeholder="Enter reason for removing funds"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="cancel-button" onClick={() => setShowRemoveFundsDialog(false)}>Cancel</button>
              <button className="confirm-button remove-button" onClick={handleRemoveFunds}>Remove Funds</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add prop types validation
SellerWallet.propTypes = {
  sellerId: PropTypes.string
}
