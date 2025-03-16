"use client"

import "./UserMenu.css"
import { Settings, User, LogOut, Shield } from "lucide-react"

export function UserMenu({ onLogout, userRole }) {
  return (
    <div className="user-menu">
      <div className="user-menu-header">
        <div className="user-avatar">
          <svg viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="user-info">
          <h3>User Account</h3>
          <p>{userRole === "admin" ? "Administrator" : "Standard User"}</p>
        </div>
      </div>

      <div className="user-menu-items">
        <a href="#" className="user-menu-item">
          <User size={16} />
          <span>Profile</span>
        </a>
        <a href="#" className="user-menu-item">
          <Settings size={16} />
          <span>Settings</span>
        </a>
        {userRole === "admin" && (
          <a href="#" className="user-menu-item">
            <Shield size={16} />
            <span>Admin Dashboard</span>
          </a>
        )}
        <button className="user-menu-item logout" onClick={onLogout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

