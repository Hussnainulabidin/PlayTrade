import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { UserProvider } from "./components/userContext/UserContext"
import "./App.css"
import "./components/AdminDashboard/ui.css"

// Landing Page
import LandingPage from "./pages/landingPage"

// Layout Components
import DashboardLayout from "./pages/Admin/AdminDashboardLayout"
import SellerDashboardLayout from "./components/layouts/SellerDashboardLayout"
import ClientDashboardLayout from "./components/layouts/ClientDashboardLayout"
import AccountsLayout from "./pages/Client/AccountsLayout"

// Game Pages
import ValorantPage from "./pages/Games/valorant"
import FortnitePage from "./pages/Games/fortnite"
import ClashofclansPage from "./pages/Games/coc"
import BrawlhallaPage from "./pages/Games/Brawl"
import LeaguePage from "./pages/Games/league"

// Admin Pages
import SellersPage from "./pages/Admin/AdminDashboardSellerPage"
import SellerDetailsPage from "./pages/Admin/AdminDashboardSellerDetails"
import SellerListingsPage from "./pages/Admin/AdminDashboardSellerListing"
import SellerWalletPage from "./pages/Admin/AdminDashboardSellerWallet"
import SellerOrdersPage from "./pages/Admin/AdminDasboardSellerOrders"
import DisputedOrdersPage from "./pages/Admin/AdminDashboardDisputedOrder"
import OrdersPage from "./pages/Admin/OrdersPage"
import OrderDetailPage from "./pages/Admin/OrderDetails"
import TicketsPage from "./pages/Admin/AdminDashboardTicketsPage"
import TicketDetailPage from "./pages/Admin/TicketDetail"
import AdminChatPage from "./pages/Admin/AdminDashboardChatPage"
import SettingPage from "./pages/Admin/SettingPage"

// Seller Pages
import SellerDashboardAccountsPage from "./pages/Seller/SellerDashboardAccountsPage"
import SellerDashboardTicketsPage from "./pages/Seller/SellerDashboardTicketsPage"
import SellerDashboardCreateTicketPage from "./pages/Seller/SellerDashboardCreateTicketPage"
import SellerDashboardChatPage from "./pages/Seller/SellerDashboardChatPage"
import SellerTicketDetailPage from "./pages/Seller/SellerTicketDetail"
import SellerSettingPage from "./pages/Seller/SellerSettingPage"

// Client Pages
import ClientOrdersPage from "./pages/Client/ClientOrdersPage"
import ClientChatPage from "./pages/Client/ClientChatPage"
import AccountsSupport from "./pages/Client/AccountsSupport"
import ClientTicketsPage from "./pages/Client/ClientTicketsPage"

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Game Accounts Routes */}
          <Route path="/accounts" element={<AccountsLayout />}>
            <Route path="valorant/*" element={<ValorantPage />} />
            <Route path="clashofclans/*" element={<ClashofclansPage />} />
            <Route path="fortnite/*" element={<FortnitePage />} />
            <Route path="brawlstars/*" element={<BrawlhallaPage />} />
            <Route path="leagueoflegends/*" element={<LeaguePage />} />
          </Route>

          {/* Account Support Routes */}
          <Route path="/accounts/valorant/support" element={<AccountsSupport />} />
          <Route path="/accounts/fortnite/support" element={<AccountsSupport />} />
          <Route path="/accounts/leagueoflegends/support" element={<AccountsSupport />} />
          <Route path="/accounts/clashofclans/support" element={<AccountsSupport />} />
          <Route path="/accounts/brawlstars/support" element={<AccountsSupport />} />

          {/* Admin Dashboard Routes */}
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/admin/tickets" element={
            <DashboardLayout>
              <TicketsPage />
            </DashboardLayout>
          } />
          <Route path="/admin/orders" element={
            <DashboardLayout>
              <OrdersPage />
            </DashboardLayout>
          } />
          <Route path="/chat" element={
            <DashboardLayout>
              <AdminChatPage />
            </DashboardLayout>
          } />
          <Route path="/admin/settings" element={
            <DashboardLayout>
              <SettingPage />
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
          <Route path="/admin/disputed-orders" element={
            <DashboardLayout>
              <DisputedOrdersPage />
            </DashboardLayout>
          } />

          {/* Client Dashboard Routes */}
          <Route path="/client/orders" element={
            <ClientDashboardLayout>
              <ClientOrdersPage />
            </ClientDashboardLayout>
          } />
          <Route path="/client/chat" element={
            <ClientDashboardLayout>
              <ClientChatPage />
            </ClientDashboardLayout>
          } />
          <Route path="/client/settings" element={
            <ClientDashboardLayout>
              <SettingPage />
            </ClientDashboardLayout>
          } />
          <Route path="/client/tickets" element={
            <ClientDashboardLayout>
              <ClientTicketsPage />
            </ClientDashboardLayout>
          } />
          <Route path="/client/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/client/support" element={
            <ClientDashboardLayout>
              <AccountsSupport />
            </ClientDashboardLayout>
          } />

          {/* Seller Dashboard Routes */}
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
                <SellerDashboardAccountsPage />
              </SellerDashboardLayout>
            }
          />
          <Route path="/seller-dashboard/chats"
            element={
              <SellerDashboardLayout>
                <SellerDashboardChatPage />
              </SellerDashboardLayout>
            }
          />
          <Route path="/seller-dashboard/tickets"
            element={
              <SellerDashboardLayout>
                <SellerDashboardTicketsPage />
              </SellerDashboardLayout>
            }
          />
          <Route path="/seller-tickets/:id" element={<SellerTicketDetailPage />} />
          <Route path="/seller-dashboard/tickets/new"
            element={
              <SellerDashboardLayout>
                <SellerDashboardCreateTicketPage />
              </SellerDashboardLayout>
            }
          />
          <Route path="/seller-dashboard/settings"
            element={
              <SellerDashboardLayout>
                <SellerSettingPage />
              </SellerDashboardLayout>
            }
          />
        </Routes >
      </Router >
    </UserProvider >
  )
}

export default App

