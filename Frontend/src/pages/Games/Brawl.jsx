import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BrawlComponent from '../../components/Accounts/BrawlStars/BrawlStars';
import BrawlDetail from '../../components/Accounts/BrawlStars/BrawlStars-detail';
import './games.css';

function BrawlPage() {
  return (
    <div className="brawl-page">
      <Routes>
        <Route path="/" element={<BrawlComponent />} />
        <Route path="/:id" element={<BrawlDetail />} />
      </Routes>
    </div>
  );
}

export default BrawlPage; 