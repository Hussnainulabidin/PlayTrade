import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Wallet,
  TicketIcon,
  ShoppingBag,
  User,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './UserMenu.css';

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', link: '/admindashboard/sellers' },
    { icon: TicketIcon, label: 'Tickets', link: '/admin/tickets' },
    { icon: MessageSquare, label: 'Chat', link: '/chat' },
    { icon: Settings, label: 'Settings', link: '/admin/settings' }
  ],
  client: [
    { icon: LayoutDashboard, label: 'Dashboard', link: '/client/chat' },
    { icon: ShoppingBag, label: 'Orders', link: '/client/orders' },
    { icon: MessageSquare, label: 'Chat', link: '/client/chat' },
    { icon: Settings, label: 'Settings', link: '/client/settings' }
  ],
  seller: [
    { icon: LayoutDashboard, label: 'Dashboard', link: '/seller/dashboard/accounts' },
    { icon: User, label: 'My Profile', link: '/seller/profile' },
    { icon: Package, label: 'My Accounts', link: '/seller/accounts' },
    { icon: Settings, label: 'Settings', link: '/seller/settings' }
  ]
};

export function UserMenu({ isOpen, onClose, userData, handleLogout }) {
  const navigate = useNavigate(); // Initialize useNavigate
  const userRole = userData?.role || 'client';
  const currentMenuItems = menuItems[userRole] || menuItems.client;

  return (
    <div className={`pt-user-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-user-info">
          <h2>{userData?.username || 'User'}</h2>
          <span className="user-id">ID: {userData?.id?.slice(-6)}</span>
        </div>
        <X className="close-icon" onClick={onClose} />
      </div>

      {/* Wallet Section */}
      <div className="wallet-section">
        <Wallet className="wallet-icon" />
        <div className="wallet-balance">
          <span className="label">Balance</span>
          <span className="balance">${userData?.balance?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="sidebar-menu">
        {currentMenuItems.map((item, index) => (
          <button
            key={index}
            className={`menu-item ${userRole === 'admin' ? 'admin-item' : ''} ${userRole === 'seller' ? 'seller-item' : ''
              }`}
            onClick={() => {
              navigate(item.link); // Navigate to the link
              onClose(); // Close the sidebar
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer with Logout */}
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}