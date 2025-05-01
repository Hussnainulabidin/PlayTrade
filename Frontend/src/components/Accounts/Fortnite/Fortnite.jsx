"use client"

import { Search, ChevronDown, Moon, Filter, Grid, List, Zap, Crown, User } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { LoginModal } from "../../LoginModal/LoginModal"
import { SignupModal } from "../../SignupModal/SignupModal"
import { useUser } from "../../userContext/UserContext"
import { UserMenu } from "../../UserMenu/UserMenu"
import '../AccountCarousel.css' // Import shared CSS for animations

export default function Fortnite() {
  const navigate = useNavigate()
  const { user, isAuthenticated, login, logout } = useUser()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sellers, setSellers] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [currentImageIndexes, setCurrentImageIndexes] = useState({})

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // 3 rows × 4 columns

  // Add filter states
  const [selectedServer, setSelectedServer] = useState("")
  const [selectedPrice, setSelectedPrice] = useState("")
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false)
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false)

  // Server options
  const platformOptions = ["All Platforms", "PC", "Xbox", "Android", "Playstation", "IOS"]

  // Price range options
  const priceOptions = [
    { label: "All Prices", value: "" },
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "$200 - $500", value: "200-500" },
    { label: "Over $500", value: "500" }
  ]

  const serverDropdownRef = useRef(null)
  const priceDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(event.target)) {
        setIsServerDropdownOpen(false)
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setIsPriceDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true)
        let queryParams = new URLSearchParams()

        if (debouncedSearchQuery) {
          queryParams.append('search', debouncedSearchQuery)
        }
        if (selectedServer) {
          queryParams.append('platform', selectedServer)
        }
        if (selectedPrice) {
          queryParams.append('price', selectedPrice)
        }

        const response = await axios.get(`http://localhost:3003/fortnite/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
        console.log('API Response:', response.data)
        if (response.data?.data?.accounts) {
          // Shuffle the accounts array
          const shuffledAccounts = [...response.data.data.accounts].sort(() => Math.random() - 0.5)
          setAccounts(shuffledAccounts)

          // Initialize image indexes for each account
          const imageIndexes = {}
          shuffledAccounts.forEach(account => {
            imageIndexes[account._id] = 0
          })
          setCurrentImageIndexes(imageIndexes)

          // Fetch seller data for each account
          const sellerPromises = shuffledAccounts.map(account =>
            axios.get(`http://localhost:3003/users/${account.sellerID}`)
              .then(res => ({
                sellerId: account.sellerID,
                sellerData: res.data.data.user
              }))
              .catch(err => ({
                sellerId: account.sellerID,
                sellerData: null
              }))
          )

          const sellerResults = await Promise.all(sellerPromises)
          const sellerMap = {}
          sellerResults.forEach(result => {
            sellerMap[result.sellerId] = result.sellerData
          })
          setSellers(sellerMap)
        } else {
          setAccounts([])
        }
        setError(null)
      } catch (err) {
        setError(err.message || "Failed to fetch accounts")
        console.error("Error fetching accounts:", err)
        setAccounts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [debouncedSearchQuery, selectedServer, selectedPrice])

  // Add image slideshow interval
  useEffect(() => {
    if (accounts.length === 0) return

    const interval = setInterval(() => {
      setCurrentImageIndexes(prevIndexes => {
        const newIndexes = { ...prevIndexes }
        accounts.forEach(account => {
          if (account.gallery && account.gallery.length > 1) {
            const currentIndex = prevIndexes[account._id] || 0
            newIndexes[account._id] = (currentIndex + 1) % account.gallery.length
          }
        })
        return newIndexes
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [accounts])

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

  const handleAccountClick = (accountId) => {
    navigate(`/accounts/fortnite/${accountId}`)
  }

  // Add pagination functions
  const totalPages = Math.ceil(accounts.length / itemsPerPage)
  const currentItems = accounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Add reset filters function
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedServer("")
    setSelectedPrice("")
    setCurrentPage(1)
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

            <div className="flex items-center gap-2 border border-gray-700 rounded-md px-3 py-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Switch Game</span>
              <ChevronDown className="w-4 h-4" />
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

      {/* Game Navigation */}
      <div className="bg-[#0d1117] border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <div className="flex items-center gap-3 mr-8">
            <div className="bg-red-500 w-10 h-10 rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-bold text-xl">Fortnite</span>
          </div>

          <div className="flex-1">
            <div className="flex">
              <button className="px-4 py-2 border-b-2 border-blue-500 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
                Accounts
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/accounts/fortnite/support")}
              className="border border-gray-700 text-gray-300 px-4 py-2 rounded-md flex items-center hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                <path
                  fillRule="evenodd"
                  d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                  clipRule="evenodd"
                />
              </svg>
              Support 24/7
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.5-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                  clipRule="evenodd"
                />
              </svg>
              Join Discord
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="bg-gray-800 w-12 h-12 rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Fortnite Accounts</h1>
            <p className="text-gray-400">Buy your dream Fortnite account today!</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative w-150">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title or rank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161b22] border border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 ml-auto">
              <div className="relative" ref={serverDropdownRef}>
                <button
                  className="border border-gray-700 text-gray-300 px-4 py-2 rounded-md flex items-center"
                  onClick={() => {
                    setIsServerDropdownOpen(!isServerDropdownOpen)
                    setIsPriceDropdownOpen(false)
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 mr-2"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 00-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 01-2.288 4.04l-.723.724a1.125 1.125 0 01-1.298.21l-.153-.076a1.125 1.125 0 01-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 01-.21-1.298L9.75 12l-1.64-1.64a6 6 0 01-1.676-3.257l-.172-1.03z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {selectedServer || "All Platforms"}
                  <ChevronDown className="ml-2 w-4 h-4" />
                </button>
                {isServerDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#161b22] border border-gray-700 rounded-md shadow-lg z-50">
                    {platformOptions.map((platform) => (
                      <button
                        key={platform}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => {
                          setSelectedServer(platform === "All Platforms" ? "" : platform)
                          setIsServerDropdownOpen(false)
                        }}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={priceDropdownRef}>
                <button
                  className="border border-gray-700 text-gray-300 px-4 py-2 rounded-md flex items-center"
                  onClick={() => {
                    setIsPriceDropdownOpen(!isPriceDropdownOpen)
                    setIsServerDropdownOpen(false)
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {selectedPrice ? priceOptions.find(opt => opt.value === selectedPrice)?.label : "All Prices"}
                  <ChevronDown className="ml-2 w-4 h-4" />
                </button>
                {isPriceDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#161b22] border border-gray-700 rounded-md shadow-lg z-50">
                    {priceOptions.map((option) => (
                      <button
                        key={option.value}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        onClick={() => {
                          setSelectedPrice(option.value)
                          setIsPriceDropdownOpen(false)
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={resetFilters}
                className="border border-gray-700 text-gray-300 px-4 py-2 rounded-md flex items-center hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
                    clipRule="evenodd"
                  />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <div className="text-red-500 mb-2">Error loading accounts</div>
              <div className="text-gray-400">{error}</div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400">No accounts found</div>
            </div>
          ) : (
            currentItems.map((account) => (
              <div
                key={account._id}
                className="bg-[#161b22] border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => handleAccountClick(account._id)}
              >
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400 bg-[#1f2228] px-3 py-1 rounded-full border border-blue-500">
                        {account.account_data.mainPlatform || "N/A"} • Level {account.account_data.level || "0"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1">
                      <span>
                        {account.title || `[${account.account_data.mainPlatform || "N/A"}] ${account.description?.substring(0, 30) || "Fortnite Account"}`}
                      </span>
                      {account.verified && <span className="bg-green-600 text-xs px-1 rounded">✓</span>}
                    </div>
                    <div className="text-sm font-medium text-blue-400">
                      IGN: {account.ign || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden">
                  <div
                    className="carousel-container"
                    style={{
                      display: 'flex',
                      width: '100%',
                      height: '180px',
                      transition: 'transform 0.5s ease-in-out',
                      transform: `translateX(-${currentImageIndexes[account._id] || 0}00%)`
                    }}
                  >
                    {account.gallery && account.gallery.length > 0 ? (
                      account.gallery.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Account screenshot ${index + 1}`}
                          className="w-full h-[180px] object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/placeholder.png";
                          }}
                        />
                      ))
                    ) : (
                      <img
                        src="/images/placeholder.png"
                        alt="Account screenshot"
                        className="w-full h-[180px] object-cover flex-shrink-0"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 rounded px-1 py-0.5 text-xs flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3 h-3 mr-1"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {account.gallery?.length || "0"}+
                  </div>
                  {account.gallery && account.gallery.length > 1 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {account.gallery.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${index === (currentImageIndexes[account._id] || 0)
                            ? "bg-blue-500"
                            : "bg-gray-500"
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    {account.account_data.SkinsCount || 0} Skins
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path
                        fillRule="evenodd"
                        d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Level {account.account_data.level || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path
                        fillRule="evenodd"
                        d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {account.account_data.VBucksCount || 0} V-Bucks
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path
                        fillRule="evenodd"
                        d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {account.account_data.EmotesCount || 0} Emotes
                  </div>
                </div>

                <div className="p-4 border-t border-gray-800 flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${account.price?.toFixed(2) || "0.00"}
                    <span className="text-xs text-gray-400 ml-1">USD</span>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center">
                    Buy Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 ml-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-3 border-t border-gray-800 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                    <span>{sellers[account.sellerID]?.username || "Seller"}</span>
                    {sellers[account.sellerID]?.verified && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-blue-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-green-500">
                    <span>{sellers[account.sellerID]?.rating || "0"}%</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path
                        fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && !error && accounts.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md border ${currentPage === page
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
