import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { UserProvider } from "./components/userContext/UserContext"
import LandingPage from "./pages/landingPage"
import SellersPage from "./pages/AdminDashboardSellerPage"
import DashboardLayout from "./pages/AdminDashboardLayout"
import SellerDetailsPage from "./pages/AdminDashboardSellerDetails"
import SellerListingsPage from "./pages/AdminDashboardSellerListing"
import SellerWalletPage from "./pages/AdminDashboardSellerWallet"
import SellerOrdersPage from "./pages/AdminDasboardSellerOrders"
import OrdersPage from "./pages/OrdersPage"
import OrderDetailPage from "./pages/OrderDetails"
import ValorantPage from "./pages/valorant"
import AccountsLayout from "./pages/AccountsLayout"
import "./App.css"
import "./components/AdminDashboard/ui.css"

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/accounts" element={<AccountsLayout />}>
            <Route path="valorant/*" element={<ValorantPage />} />
          </Route>
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/admin/orders" element={
            <DashboardLayout>
              <OrdersPage />
            </DashboardLayout>
          } />
          <Route path="/admindashboard/sellers" element={
            <DashboardLayout>
              <SellersPage />
            </DashboardLayout>
          } />
          <Route path="/admindashboard/sellers/:id" element={
            <DashboardLayout>
              <SellerDetailsPage />
            </DashboardLayout>
          } />
          <Route path="/admindashboard/sellers/:id/listings" element={
            <DashboardLayout>
              <SellerListingsPage />
            </DashboardLayout>
          } />
          <Route path="/admindashboard/sellers/:id/wallet" element={
            <DashboardLayout>
              <SellerWalletPage />
            </DashboardLayout>
          } />
          <Route path="/admindashboard/sellers/:id/orders" element={
            <DashboardLayout>
              <SellerOrdersPage />
            </DashboardLayout>
          } />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App

