import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LeagueComponent from '../components/Accounts/League/League';
import LeagueDetail from '../components/Accounts/League/League-detail';
import './League.css';

function LeaguePage() {
  return (
    <div className="league-page">
      <Routes>
        <Route path="/" element={<LeagueComponent />} />
        <Route path="/:id" element={<LeagueDetail />} />
      </Routes>
    </div>
  );
}

export default LeaguePage; 