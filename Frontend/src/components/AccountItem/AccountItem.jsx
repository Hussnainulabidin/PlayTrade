import { MoreHorizontal } from "lucide-react"
import GameIcon from "../GameIcon/GameIcon"
import "./AccountItem.css"

const AccountItem = ({ account }) => {
    const getStatusClass = (status) => {
        return status === "active" ? "status-listed" : status === "sold" ? "status-sold" : "status-draft"
    }

    const formatCredentials = (account) => {
        return `${account.login}:${account.password}`
    }

    return (
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

            <div className="actions-cell">
                <button className="action-btn">
                    <MoreHorizontal size={16} />
                </button>
            </div>
        </div>
    )
}

export default AccountItem
