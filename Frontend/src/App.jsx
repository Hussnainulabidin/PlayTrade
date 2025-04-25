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
import SellerDashboardTicketsPage from "./pages/SellerDashboardTicketsPage"
import SellerDashboardCreateTicketPage from "./pages/SellerDashboardCreateTicketPage"
import SellerDashboardChatPage from "./pages/SellerDashboardChatPage"
import SellerDashboardLayout from "./components/layouts/SellerDashboardLayout"
import OrdersPage from "./pages/OrdersPage"
import OrderDetailPage from "./pages/OrderDetails"
import TicketsPage from "./pages/AdminDashboardTicketsPage"
import TicketDetailPage from "./pages/TicketDetail"
import SellerTicketDetailPage from "./pages/SellerTicketDetail"

import ValorantPage from "./pages/valorant"
import FortnitePage from "./pages/fortnite"
import ClashofclansPage from "./pages/coc"
import BrawlhallaPage from "./pages/Brawl"
import LeaguePage from "./pages/league"

import AccountsLayout from "./pages/AccountsLayout"
import AdminChatPage from "./pages/AdminDashboardChatPage"
import SettingPage from "./pages/SettingPage"
import ClientDashboardLayout from "./components/layouts/ClientDashboardLayout"
import ClientOrdersPage from "./pages/ClientOrdersPage"
import ClientChatPage from "./pages/ClientChatPage"
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
            <Route path="clashofclans/*" element={<ClashofclansPage />} />
            <Route path="fortnite/*" element={<FortnitePage />} />
            <Route path="brawlstars/*" element={<BrawlhallaPage />} />
            <Route path="leagueoflegends/*" element={<LeaguePage />} />
          </Route>
          
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/admin/tickets" element={
            <DashboardLayout>
              <TicketsPage />
            </DashboardLayout>
          }
          />
          
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
                <SettingPage />
              </SellerDashboardLayout>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  )
}

export default App

