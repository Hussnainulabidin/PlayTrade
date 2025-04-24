import AccountItem from "../AccountItem/AccountItem"
import "./AccountsTable.css"

const AccountsTable = ({ accounts }) => {
    return (
        <div className="accounts-table-seller">
            <div className="table-header-seller">
                <div className="checkbox-cell">
                    <input type="checkbox" />
                </div>
                <div className="title-cell">TITLE</div>
                <div className="account-id-cell">ACCOUNT ID</div>
                <div className="credentials-cell">CREDENTIALS</div>
                <div className="status-cell">STATUS</div>
                <div className="views-cell">VIEWS</div>
                <div className="price-cell">PRICE</div>
                <div className="last-updated-cell">LAST UPDATED</div>
                <div className="actions-cell"></div>
            </div>

            <div className="table-body-seller">
                {accounts.length > 0 ? (
                    accounts.map((account) => <AccountItem key={account._id} account={account} />)
                ) : (
                    <div className="no-accounts">No accounts found</div>
                )}

            </div>
        </div>
    )
}

export default AccountsTable
