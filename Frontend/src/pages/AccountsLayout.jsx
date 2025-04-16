import React from 'react';
import { Outlet } from 'react-router-dom';
import './AccountsLayout.css';

function AccountsLayout() {
  return (
    <div className="accounts-layout">
      <Outlet />
    </div>
  );
}

export default AccountsLayout; 