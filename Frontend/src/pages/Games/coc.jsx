import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CocComponent from '../../components/Accounts/Coc/Coc';
import CocDetail from '../../components/Accounts/Coc/Coc-detail';
import './games.css';

function CocPage() {
  return (
    <div className="coc-page">
      <Routes>
        <Route path="/" element={<CocComponent />} />
        <Route path="/:id" element={<CocDetail />} />
      </Routes>
    </div>
  );
}

export default CocPage; 