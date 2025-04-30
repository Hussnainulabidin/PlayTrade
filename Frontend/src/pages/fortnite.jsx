import React from 'react';
import { Routes, Route } from 'react-router-dom'
import FortniteComponent from '../components/Accounts/Fortnite/Fortnite'
import FortniteDetail from '../components/Accounts/Fortnite/Fortnite-detail'
import './games.css'

function FortnitePage() {
  return (
    <div className="fortnite-page">
    <Routes>
      <Route path="/" element={<FortniteComponent />} />
      <Route path="/:id" element={<FortniteDetail />} />
    </Routes>
    </div>
  )
} 
export default FortnitePage; 