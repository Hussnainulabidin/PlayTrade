import "./Sidebar.css"

function Sidebar() {
  const menuItems = [
    { icon: "🏠", label: "Home" },
    { icon: "🎮", label: "Games" },
    { icon: "🏆", label: "Tournaments" },
    { icon: "👥", label: "Community" },
    { icon: "📊", label: "Stats" },
    { icon: "⚙️", label: "Settings" },
  ]

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <a href="#" className="sidebar-item">
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

