"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ArrowUpRight, ArrowDownRight, Search, Minus } from "lucide-react"
import PropTypes from "prop-types"
import { userApi, walletApi } from "../../../api"
import "./SellerWallets.css"
import { formatDate } from "../../../lib/utils"

export function SellerWallet({ sellerId }) {

    const params = useParams();
    const userId = sellerId || params.id;

    const [searchQuery, setSearchQuery] = useState("")
    const [showWithdrawFundsDialog, setShowWithdrawFundsDialog] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [withdrawReason, setWithdrawReason] = useState("")

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
                setError(null) // Clear any previous errors when starting a new fetch

                // Skip API calls if userId is not available yet
                if (!userId) {
                    setLoading(false)
                    return
                }

                // Get user info for balance
                const userResponse = await userApi.getMe();

                // Get wallet transactions
                const transactionsResponse = await walletApi.getSellerTransactions(userId, 1, 50);

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
    }, [userId]);

    const filteredTransactions = walletData.transactions.filter(
        (transaction) =>
            transaction.id.includes(searchQuery) ||
            transaction.reason.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleWithdrawFunds = async () => {
        try {
            const response = await walletApi.withdraw(
                parseFloat(withdrawAmount),
                userId,
                withdrawReason || "Funds withdrawn by seller"
            );

            if (response.data.status === 'success') {
                alert(`Withdrew €${withdrawAmount} from wallet successfully`);
                // Reload wallet data
                window.location.reload();
            }
        } catch (err) {
            console.error("Error withdrawing funds:", err);
            alert(`Failed to withdraw funds: ${err.response?.data?.message || err.message}`);
        }

        setWithdrawAmount("");
        setWithdrawReason("");
        setShowWithdrawFundsDialog(false);
    }

    return (
        <div className="seller-wallet">
            <div className="seller-wallet__header">
                <h1>My Wallet</h1>
            </div>

            {loading ? (
                <div className="seller-wallet__loading">
                    <div className="seller-wallet__spinner"></div>
                    <div className="seller-wallet__loading-text">Loading wallet data...</div>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="seller-wallet__error">
                            {error}
                        </div>
                    )}

                    <div className="seller-wallet__cards">
                        {/* Balance Card */}
                        <div className="seller-wallet__card">
                            <div className="seller-wallet__card-content">
                                <h2 className="seller-wallet__card-title">Wallet Balance</h2>
                                <p className="seller-wallet__card-desc">Current available funds</p>
                                <p className="seller-wallet__balance">{walletData.balance}</p>
                            </div>
                        </div>

                        {/* Withdraw Funds Card */}
                        <div className="seller-wallet__card">
                            <div className="seller-wallet__card-content">
                                <h2 className="seller-wallet__card-title">Withdraw Funds</h2>
                                <p className="seller-wallet__card-desc">Transfer funds to your bank account</p>
                                <button className="seller-wallet__withdraw-btn" onClick={() => setShowWithdrawFundsDialog(true)}>
                                    <Minus size={18} /> Withdraw Funds
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search and Transactions */}
                    <div className="seller-wallet__transactions">
                        <div className="seller-wallet__search">
                            <Search className="seller-wallet__search-icon" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="seller-wallet__search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="seller-wallet__table-container">
                            {filteredTransactions.length === 0 ? (
                                <div className="seller-wallet__empty">
                                    No transactions found.
                                </div>
                            ) : (
                                <table className="seller-wallet__table">
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
                                                <td className="seller-wallet__txn-id">#{transaction.id}</td>
                                                <td>
                                                    <div className="seller-wallet__txn-type">
                                                        {transaction.type === "Credit" ? (
                                                            <ArrowUpRight className="seller-wallet__txn-icon--credit" />
                                                        ) : (
                                                            <ArrowDownRight className="seller-wallet__txn-icon--debit" />
                                                        )}
                                                        <span className={`seller-wallet__txn-badge seller-wallet__txn-badge--${transaction.type.toLowerCase()}`}>
                                                            {transaction.type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className={`seller-wallet__txn-amount seller-wallet__txn-amount--${transaction.type.toLowerCase()}`}>
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

            {/* Withdraw Funds Dialog */}
            {showWithdrawFundsDialog && (
                <div className="seller-wallet__dialog-overlay" onClick={() => setShowWithdrawFundsDialog(false)}>
                    <div className="seller-wallet__dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="seller-wallet__dialog-header">
                            <h2>Withdraw Funds</h2>
                            <p>Enter the amount and provide bank details for withdrawal.</p>
                            <button className="seller-wallet__dialog-close" onClick={() => setShowWithdrawFundsDialog(false)}>×</button>
                        </div>
                        <div className="seller-wallet__dialog-body">
                            <div className="seller-wallet__form-group">
                                <label htmlFor="withdraw-amount">Amount (€)</label>
                                <input
                                    id="withdraw-amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                />
                            </div>
                            <div className="seller-wallet__form-group">
                                <label htmlFor="withdraw-reason">Bank Details / Notes</label>
                                <textarea
                                    id="withdraw-reason"
                                    placeholder="Enter your bank details or any notes for withdrawal"
                                    value={withdrawReason}
                                    onChange={(e) => setWithdrawReason(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="seller-wallet__dialog-footer">
                            <button className="seller-wallet__btn seller-wallet__btn--cancel" onClick={() => setShowWithdrawFundsDialog(false)}>Cancel</button>
                            <button className="seller-wallet__btn seller-wallet__btn--confirm" onClick={handleWithdrawFunds}>Request Withdrawal</button>
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