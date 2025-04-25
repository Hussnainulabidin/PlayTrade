"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { ChevronLeft, Heart, ShoppingCart, Shield, Clock, User, Star, Check, AlertTriangle } from "lucide-react"
import { useUser } from "../../userContext/UserContext"
import { LoginModal } from "../../LoginModal/LoginModal"
import { SignupModal } from "../../SignupModal/SignupModal"
import { UserMenu } from "../../UserMenu/UserMenu"
import { ChevronDown, Moon, Zap, Crown, ArrowLeft } from "lucide-react"

export default function FortniteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, login, logout } = useUser()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [account, setAccount] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setLoading(true)
        // Fetch account details
        const accountResponse = await axios.get(`http://localhost:3003/clashofclans/accounts/${id}`)
        const accountData = accountResponse.data.data?.account

        if (accountData) {
          setAccount(accountData)
          
          // Fetch seller details if we have a seller ID
          if (accountData.sellerID) {
            try {
              const sellerResponse = await axios.get(`http://localhost:3003/users/${accountData.sellerID}`)
              setSeller(sellerResponse.data.data?.user)
            } catch (error) {
              console.error("Error fetching seller:", error)
            }
          }
        } else {
          setError("Account not found")
        }
      } catch (err) {
        setError(err.message || "Failed to fetch account details")
        console.error("Error fetching account details:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAccountDetails()
    }
  }, [id])

  const handleLoginSuccess = async (userData) => {
    await login(userData)
  }

  const handleLogout = () => {
    logout()
    setIsSidebarOpen(false)
  }

  const switchToSignup = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  const switchToLogin = () => {
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true)
      return
    }

    try {
      setIsProcessingOrder(true)
      
      // Get the auth token
      let token = localStorage.getItem('jwt') || sessionStorage.getItem('jwt') || localStorage.getItem('token')
      
      // Remove quotes if they exist
      if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1)
      }
      
      // Create the order
      const response = await axios.post(
        "http://localhost:3003/orders", 
        {
          accountID: id,
          gameType: "Clash of Clans"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      if (response.data.status === 'success') {
        // Navigate to the order details page
        const orderId = response.data.data._id
        navigate(`/order/${orderId}`)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (err) {
      console.error("Error creating order:", err)
      alert(err.response?.data?.message || "Failed to create order. Please try again.")
    } finally {
      setIsProcessingOrder(false)
    }
  }

  const renderUserMenu = () => {
    if (isAuthenticated && user) {
      return (
        <div className="relative">
          <div onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {user.username ? (
              <div className="user-initial pt-user-icon cursor-pointer">{user.username.charAt(0).toUpperCase()}</div>
            ) : (
              <User className="pt-icon" />
            )}
          </div>
          <UserMenu
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            userData={{
              username: user.username,
              role: user.role,
              email: user.email,
              balance: user.balance || 0,
              id: user._id,
            }}
            handleLogout={handleLogout}
          />
        </div>
      )
    }

    return (
      <button
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center"
        onClick={() => setIsLoginModalOpen(true)}
      >
        Login
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1">
          <path
            fillRule="evenodd"
            d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    )
  }

  // Mock data for screenshots (replace with actual data when available)
  const screenshots = [
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
    "/placeholder.svg?height=600&width=800",
  ]

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d1117]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:opacity-90"
                onClick={() => navigate('/')}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center">
                  <Crown className="pt-crown-icon w-5 h-5" />
                </div>
                <span className="pt-logo-text">
                  <span className="pt-blue">PLAY</span>TRADE
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Moon className="w-5 h-5" />
            {renderUserMenu()}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        switchToSignup={switchToSignup}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        switchToLogin={switchToLogin}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button 
          onClick={() => navigate('/accounts/clashofclans')}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Accounts
        </button>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 mb-2">Error loading account</div>
            <div className="text-gray-400">{error}</div>
          </div>
        ) : account ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Account images */}
            <div className="lg:col-span-2">
              <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h1 className="text-2xl font-bold">
                    {account.title || `[${account.server || "N/A"}] ${account.description?.substring(0, 30) || "Fortnite Account"}`}
                  </h1>
               
                </div>
                <div>
                  <img
                    src={account.imageUrl || "/placeholder.svg?height=400&width=800"}
                    alt="Account screenshot"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-300 whitespace-pre-line">
                    {account.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Account details */}
              <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden mt-6 p-5">
                <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Town Hall Level</div>
                    <div className="text-lg font-semibold">{account.account_data?.TownHallLevel || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Gems</div>
                    <div className="text-lg font-semibold">{account.account_data?.Gems || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Trophies</div>
                    <div className="text-lg font-semibold">{account.account_data?.TrophyCount || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Clan Level</div>
                    <div className="text-lg font-semibold">{account.account_data?.ClanLevel || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Minion Prince</div>
                    <div className="text-lg font-semibold">{account.account_data?.MinionPrinceLevel || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Barbarian King</div>
                    <div className="text-lg font-semibold">{account.account_data?.BarbarianKingLevel || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Archer Queen</div>
                    <div className="text-lg font-semibold">{account.account_data?.ArcherQueenLevel || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Grand Warden</div>
                    <div className="text-lg font-semibold">{account.account_data?.GrandWardenLevel || 0}</div>
                  </div>
                  <div className="bg-[#1f2228] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Royal Champion</div>
                    <div className="text-lg font-semibold">{account.account_data?.RoyalChampionLevel || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Price and seller info */}
            <div>
              <div className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden sticky top-4">
                <div className="p-5 border-b border-gray-800">
                  <div className="text-3xl font-bold mb-1">
                    ${account.price?.toFixed(2) || "0.00"}
                    <span className="text-sm text-gray-400 ml-1">USD</span>
                  </div>
                  <button 
                    className={`w-full ${isProcessingOrder ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} py-3 rounded-md font-semibold flex items-center justify-center`}
                    onClick={handleBuyNow}
                    disabled={isProcessingOrder}
                  >
                    {isProcessingOrder ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Processing...
                      </>
                    ) : (
                      'Buy Now'
                    )}
                  </button>
                </div>

                {/* Seller info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-semibold">
                      {seller?.username ? seller.username.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {seller?.username || "Seller"}
                        {seller?.verified && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 text-blue-500 ml-1"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="text-green-500 text-sm flex items-center">
                        <span>{seller?.rating || "98"}% Positive</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Member since {seller?.joinDate ? new Date(seller.joinDate).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400">Account not found</div>
          </div>
        )}
      </main>
    </div>
  )
} 