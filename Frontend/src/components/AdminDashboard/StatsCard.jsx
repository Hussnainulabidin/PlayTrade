function StatsCard({ label, value, icon, change }) {
    return (
      <div className="stat-card">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
          <h3>{label}</h3>
          <div className="stat-value">
            <span>{value}</span>
            {change && <span className="stat-change">{change}</span>}
          </div>
        </div>
      </div>
    )
  }
  
  export default StatsCard
  
  