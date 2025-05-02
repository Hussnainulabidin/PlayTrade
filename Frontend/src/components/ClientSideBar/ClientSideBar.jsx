import { Link, useLocation } from "react-router-dom"
import { 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  LogOut,
  User,
  Wallet,
  Crown,
  TicketIcon
} from "lucide-react"
import { useUser } from "../userContext/UserContext"
import { useState, useEffect } from "react"

const ClientSidebar = () => {
  const location = useLocation()
  const { user, logout } = useUser()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: ShoppingBag, label: "Orders", link: "/client/orders" },
    { icon: MessageSquare, label: "Chat", link: "/client/chat" },
    { icon: TicketIcon, label: "Support Tickets", link: "/client/tickets" },
    { icon: Settings, label: "Settings", link: "/client/settings" }
  ];

  return (
    <>
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-[#0f0d1d] border-b border-[#1f1b31] p-3 flex items-center justify-between z-50">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-1.5 rounded">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-medium text-white">
              <span className="text-blue-500">PLAY</span>TRADE
            </h1>
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-gray-400 hover:bg-[#1f1b31] rounded-lg"
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      )}
      
      <aside 
        className={`fixed top-0 left-0 h-screen bg-[#0f0d1d] border-r border-[#1f1b31] flex flex-col z-40 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 overflow-hidden'
        } ${isMobile ? 'mt-12' : ''}`}
      >
        {!isMobile && (
          <div className="flex items-center gap-2 p-4 border-b border-[#1f1b31]">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-blue-600 p-1.5 rounded">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-white">
                  <span className="text-blue-500">PLAY</span>TRADE
                </h1>
                <p className="text-xs text-gray-400">Client Panel</p>
              </div>
        </Link>
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item, index) => (
              <li key={index}>
        <Link
                  to={item.link}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    location.pathname.startsWith(item.link)
                      ? "bg-[#7C3AED] text-white"
                      : "text-gray-400 hover:bg-[#1f1b31] hover:text-white"
                  }`}
                  onClick={() => isMobile && setIsOpen(false)}
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
              <p className="text-sm font-medium text-white truncate">
                {user?.username || "Client User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || "client@example.com"}
              </p>
            </div>
            <button 
              className="p-1.5 hover:bg-[#1f1b31] rounded-lg transition-colors"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
      </aside>
      
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ClientSidebar; 