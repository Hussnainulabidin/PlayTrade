import AccountItem from "../AccountItem/AccountItem"
import "./AccountsTable.css"

const AccountsTable = ({ accounts }) => {
    return (
        <div className="accounts-table">
            <div className="table-header">
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

            <div className="table-body">
                {accounts.length > 0 ? (
                    accounts.map((account) => <AccountItem key={account._id} account={account} />)
                ) : (
                    <div className="no-accounts">No accounts found</div>
                )}

                {/* Fallback demo data if no accounts are provided */}
                {accounts.length === 0 && (
                    <>
                        <AccountItem
                            account={{
                                _id: "1178959",
                                title: "🔥 2 X SUPER CARs -BENTLY + HELLFIRE SUPER CAR",
                                gameType: "PUBG Mobile",
                                login: "+92 03485321220",
                                password: "hamad123",
                                status: "active",
                                views: 151,
                                price: 289.99,
                                lastUpdated: "2024-03-20T12:00:00.000Z",
                            }}
                        />
                        <AccountItem
                            account={{
                                _id: "1181612",
                                title: "EU -Turkey - ⭐ Evori Dreamwings Vandal + ⭐ NO RECOIL",
                                gameType: "Valorant",
                                login: "SALMANPLAY201",
                                password: "realkrat0s",
                                status: "sold",
                                views: 272,
                                price: 49.99,
                                lastUpdated: "2024-03-19T12:00:00.000Z",
                            }}
                        />
                        <AccountItem
                            account={{
                                _id: "1211756",
                                title: "EU -Cheap (Reaver/Oni) Smexy Combo- Reaver Vandal",
                                gameType: "Valorant",
                                login: "runwayspike99",
                                password: "bubbly@VaLo321",
                                status: "active",
                                views: 59,
                                price: 51.00,
                                lastUpdated: "2024-03-19T12:00:00.000Z",
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

export default AccountsTable
