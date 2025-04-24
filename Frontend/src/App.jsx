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
import TicketsPage from "./pages/AdminDashboardTicketsPage"
import TicketDetailPage from "./pages/TicketDetail"
import ValorantPage from "./pages/valorant"
import FortnitePage from "./pages/fortnite"
import LeaguePage from "./pages/League"
import CocPage from "./pages/coc"
import BrawlPage from "./pages/Brawl"
import AccountsLayout from "./pages/AccountsLayout"
import AdminChatPage from "./pages/AdminDashboardChatPage"
import AdminSettingsPage from "./pages/SettingPage"
import AccountsSupport from "./pages/AccountsSupport"
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
            <Route path="fortnite/*" element={<FortnitePage />} />
            <Route path="leagueoflegends/*" element={<LeaguePage />} />
            <Route path="clashofclans/*" element={<CocPage />} />
            <Route path="brawlstars/*" element={<BrawlPage />} />
          </Route>
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />}/>
          <Route path="/admin/tickets" element={
            <DashboardLayout>
              <TicketsPage />
            </DashboardLayout>
          }/>
          
          <Route path="/admin/orders" element={
            <DashboardLayout>
              <OrdersPage />
            </DashboardLayout>
          } />
          <Route path="/admin/chat" element={
            <DashboardLayout>
              <AdminChatPage />
            </DashboardLayout>
          } />
          <Route path="/admin/settings" element={
            <DashboardLayout>
              <AdminSettingsPage />
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
          <Route path="/accounts/valorant/support" element={<AccountsSupport />} />
          <Route path="/accounts/fortnite/support" element={<AccountsSupport />} />
          <Route path="/accounts/leagueoflegends/support" element={<AccountsSupport />} />
          <Route path="/accounts/clashofclans/support" element={<AccountsSupport />} />
          <Route path="/accounts/brawlstars/support" element={<AccountsSupport />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App

