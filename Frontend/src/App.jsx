import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { UserProvider } from "./components/userContext/UserContext"
import LandingPage from "./pages/landingPage"
import SellersPage from "./pages/AdminDashboardSellerPage"
import DashboardLayout from "./pages/AdminDashboardLayout"
import SellerDetailsPage from "./pages/AdminDashboardSellerDetails"
import SellerListingsPage from "./pages/AdminDashboardSellerListing"
import SellerWalletPage from "./pages/AdminDashboardSellerWallet"
import SellerOrdersPage from "./pages/AdminDasboardSellerOrders"
import SellerDashboardAccountsPage from "./pages/SellerDashboardAccountsPage"
import SellerDashboardAccountImportsPage from "./pages/SellerDashboardAccountImportsPage"
import SellerDashboardLayout from "./components/layouts/SellerDashboardLayout"
import OrdersPage from "./pages/OrdersPage"
import OrderDetailPage from "./pages/OrderDetails"
import "./App.css"
import "./components/AdminDashboard/ui.css"

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/admin/orders" element={
            <DashboardLayout>
              <OrdersPage />
            </DashboardLayout>
          }
          />
          <Route path="/admindashboard/sellers" element={
            <DashboardLayout>
              <SellersPage />
            </DashboardLayout>
          }
          />
          <Route path="/admindashboard/sellers/:id"
            element={
              <DashboardLayout>
                <SellerDetailsPage />
              </DashboardLayout>
            }
          />
          <Route path="/admindashboard/sellers/:id/listings"
            element={
              <DashboardLayout>
                <SellerListingsPage />
              </DashboardLayout>
            }
          />
          <Route path="/admindashboard/sellers/:id/wallet"
            element={
              <DashboardLayout>
                <SellerWalletPage />
              </DashboardLayout>
            }
          />
          <Route path="/admindashboard/sellers/:id/orders"
            element={
              <DashboardLayout>
                <SellerOrdersPage />
              </DashboardLayout>
            }
          />

          //Seller Dashboard Routes
          <Route path="/seller/dashboard/accounts"
            element={
              <SellerDashboardLayout>
                <SellerDashboardAccountsPage />
              </SellerDashboardLayout>
            }
          />
          <Route path="/seller-dashboard/account-imports"
            element={
              <SellerDashboardLayout>
                <SellerDashboardAccountImportsPage />
              </SellerDashboardLayout>
            }
          />

        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App

