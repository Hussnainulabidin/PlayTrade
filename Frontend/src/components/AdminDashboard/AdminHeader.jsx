import { Wallet } from "lucide-react";
import "./AdminHeader.css";

export function AdminHeader() {
  return (
    <div className="admin-header">
      <div className="header-content">
        <div className="header-icon-container">
          <Wallet className="header-icon" />
        </div>
        <h1 className="header-title">Admin Panel</h1>
      </div>
    </div>
  );
} 