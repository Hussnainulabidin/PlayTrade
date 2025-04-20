import { Link, useLocation } from "react-router-dom"
import { 
  Users, 
  ShoppingCart,
  Wallet,
  LogOut,
  User,
  MessageSquare,
  TicketIcon,
  Settings
} from "lucide-react"

export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: Users, label: "Sellers", link: "/admindashboard/sellers" },
    { icon: ShoppingCart, label: "Orders", link: "/admin/orders" },
    { icon: TicketIcon, label: "Tickets", link: "/admin/tickets" },
    { icon: MessageSquare, label: "Chat", link: "/admin/chat" },
    { icon: Settings, label: "Settings", link: "/admin/settings" }
  ]

  return (
    <aside className="w-64 h-screen bg-[#0f0d1d] border-r border-[#1f1b31] flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b border-[#1f1b31]">
        <div className="bg-blue-600 p-1.5 rounded">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-medium text-white">Admin Panel</h1>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.link}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  location.pathname === item.link
                    ? "bg-[#7C3AED] text-white"
                    : "text-gray-400 hover:bg-[#1f1b31] hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#1f1b31]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#1f1b31] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@example.com</p>
          </div>
          <button className="p-1.5 hover:bg-[#1f1b31] rounded-lg transition-colors">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  )
}
