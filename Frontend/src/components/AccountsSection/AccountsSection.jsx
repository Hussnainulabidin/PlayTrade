import "./AccountsSection.css"

function AccountsSection() {
  return (
    <div className="accounts-section">
      <div className="accounts-icon">
        <svg viewBox="0 0 24 24">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="accounts-text">
        <h2>Accounts</h2>
        <p>Browse our selection of Accounts</p>
      </div>
    </div>
  )
}

export default AccountsSection

