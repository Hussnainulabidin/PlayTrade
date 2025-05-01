import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ValorantComponent from '../../components/Accounts/Valorant/Valorant';
import ValorantDetail from '../../components/Accounts/Valorant/Valorant-detail';
import './games.css';

function ValorantPage() {
  return (
    <div className="valorant-page">
      <Routes>
        <Route path="/" element={<ValorantComponent />} />
        <Route path="/:id" element={<ValorantDetail />} />
      </Routes>
    </div>
  );
}

export default ValorantPage; 