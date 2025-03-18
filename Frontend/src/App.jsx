import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import LandingPage from "./pages/landingPage"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./components/AdminDashboard/AdminDashboard"
import "./App.css"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App

