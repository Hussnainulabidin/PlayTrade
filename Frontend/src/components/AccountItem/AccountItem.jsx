import { MoreHorizontal, Edit, ToggleLeft } from "lucide-react"
import GameIcon from "../GameIcon/GameIcon"
import EditStatusModal from "../EditStatusModal/EditStatusModal"
import AddAccountModal from "../AddAccountModal/AddAccountModel"
import "./AccountItem.css"
import { useState, useRef, useEffect } from "react"

const AccountItem = ({ account }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const dropdownRef = useRef(null)

    const getStatusClass = (status) => {
        return status === "active" ? "status-listed" : status === "sold" ? "status-sold" : "status-draft"
    }

    const formatCredentials = (account) => {
        return `${account.login}:${account.password}`
    }

    const handleDropdownClick = (e) => {
        e.stopPropagation()
        setIsDropdownOpen(!isDropdownOpen)
    }

    const handleEditAccount = () => {
        setIsDropdownOpen(false)
        setIsEditModalOpen(true)
    }

    const handleEditStatus = () => {
        setIsDropdownOpen(false)
        setIsStatusModalOpen(true)
    }

    const handleStatusChange = async (newStatus) => {
        try {
            // Send PATCH request to update the account status
            const response = await fetch(`http://localhost:3003/gameAccounts/update-status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: newStatus, accountId: account._id, gameType: account.gameType }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            console.log('Status updated successfully');

        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsStatusModalOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <>
            <div className="account-item">
                <div className="checkbox-cell">
                    <input type="checkbox" />
                </div>

                <div className="title-cell">
                    <div className="game-info">
                        <GameIcon game={account.gameType} />
                        <div className="title-content">
                            <div className="account-title">{account.title}</div>
                            <div className="game-name">{account.gameType}</div>
                        </div>
                    </div>
                </div>

                <div className="account-id-cell">#{account._id.slice(-6)}</div>

                <div className="credentials-cell">{formatCredentials(account)}</div>

                <div className="status-cell">
                    <span className={`status-pill status-${account.status.toLowerCase()}`}>
                        {account.status}
                    </span>
                </div>

                <div className="views-cell">{account.views || 0}</div>

                <div className="price-cell">${account.price}</div>

                <div className="last-updated-cell">{new Date(account.lastUpdated).toLocaleDateString()}</div>

                <div className="actions-cell" ref={dropdownRef}>
                    <button className="action-btn" onClick={handleDropdownClick}>
                        <MoreHorizontal size={16} />
                    </button>
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={handleEditAccount}>
                                <Edit size={14} className="dropdown-item-icon" />
                                <span>Edit Account</span>
                            </button>
                            <button className="dropdown-item" onClick={handleEditStatus}>
                                <ToggleLeft size={14} className="dropdown-item-icon" />
                                <span>Edit Status</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <EditStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                account={account}
                onStatusChange={handleStatusChange}
            />

            <AddAccountModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={account}
                isEditMode={true}
            />
        </>
    )
}

export default AccountItem
