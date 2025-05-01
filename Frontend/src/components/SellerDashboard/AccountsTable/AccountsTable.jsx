import AccountItem from "../AccountItem/AccountItem"
import "./SellerAccountsTable.css"

const AccountsTable = ({ accounts }) => {
    return (
        <div className="pt-accounts-table">
            <div className="pt-table__header">
                <div className="pt-cell--checkbox">
                    <input type="checkbox" />
                </div>
                <div className="pt-cell--title">TITLE</div>
                <div className="pt-cell--account-id">ACCOUNT ID</div>
                <div className="pt-cell--credentials">CREDENTIALS</div>
                <div className="pt-cell--status">STATUS</div>
                <div className="pt-cell--views">VIEWS</div>
                <div className="pt-cell--price">PRICE</div>
                <div className="pt-cell--last-updated">LAST UPDATED</div>
                <div className="pt-cell--actions"></div>
            </div>

            <div className="pt-table__body">
                {accounts.length > 0 ? (
                    accounts.map((account) => <AccountItem key={account._id} account={account} />)
                ) : (
                    <div className="pt-table__empty">No accounts found</div>
                )}

            </div>
        </div>
    )
}

export default AccountsTable
