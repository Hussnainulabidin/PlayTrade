"use client"

import { useState, useEffect } from "react"
import "./AdminDashboard.css"
import {
  Users,
  GamepadIcon,
  BarChart2,
  Settings,
  Shield,
  Bell,
  Plus,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react"
import axios from "axios"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Dialog, DialogContent } from "../ui/dialog"
import UserForm from "./UserForm"
import GameForm from "./GameForm"
import StatsCard from "./StatsCard"
//import { toast } from "../ui/toast"

const API_URL = "http://localhost:3003/api"

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dashboard data
  const [stats, setStats] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [recentGames, setRecentGames] = useState([])

  // Users management
  const [users, setUsers] = useState([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Games management
  const [games, setGames] = useState([])
  const [gameSearchTerm, setGameSearchTerm] = useState("")
  const [filteredGames, setFilteredGames] = useState([])
  const [isGameFormOpen, setIsGameFormOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  })

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData()
    }
  }, [activeTab])

  // Fetch users data
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab])

  // Fetch games data
  useEffect(() => {
    if (activeTab === "games") {
      fetchGames()
    }
  }, [activeTab])

  // Filter users based on search term
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(userSearchTerm.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }, [users, userSearchTerm])

  // Filter games based on search term
  useEffect(() => {
    if (games.length > 0) {
      const filtered = games.filter(
        (game) =>
          game.title?.toLowerCase().includes(gameSearchTerm.toLowerCase()) ||
          game.status?.toLowerCase().includes(gameSearchTerm.toLowerCase()),
      )
      setFilteredGames(filtered)
    }
  }, [games, gameSearchTerm])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to fetch real data from API
      try {
        const token = localStorage.getItem("token")
        const statsResponse = await axios.get(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const usersResponse = await axios.get(`${API_URL}/admin/users/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const gamesResponse = await axios.get(`${API_URL}/admin/games/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setStats(statsResponse.data)
        setRecentUsers(usersResponse.data)
        setRecentGames(gamesResponse.data)
      } catch (apiError) {
        console.error("API Error:", apiError)
        // Fallback to mock data if API fails
        setStats([
          { label: "Total Users", value: "12,345", icon: "Users", change: "+12%" },
          { label: "Active Games", value: "87", icon: "GameController", change: "+5%" },
          { label: "Revenue", value: "$45,678", icon: "BarChart2", change: "+23%" },
          { label: "New Users", value: "432", icon: "Users", change: "+18%" },
        ])

        setRecentUsers([
          { id: 1, username: "John Doe", email: "john@example.com", role: "user", createdAt: "2023-05-15" },
          { id: 2, username: "Jane Smith", email: "jane@example.com", role: "admin", createdAt: "2023-05-14" },
          { id: 3, username: "Bob Johnson", email: "bob@example.com", role: "user", createdAt: "2023-05-13" },
          { id: 4, username: "Alice Brown", email: "alice@example.com", role: "user", createdAt: "2023-05-12" },
          {
            id: 5,
            username: "Charlie Wilson",
            email: "charlie@example.com",
            role: "moderator",
            createdAt: "2023-05-11",
          },
        ])

        setRecentGames([
          { id: 1, title: "Fortnite", users: 5432, status: "active" },
          { id: 2, title: "Valorant", users: 3211, status: "active" },
          { id: 3, title: "Minecraft", users: 2876, status: "active" },
          { id: 4, title: "League of Legends", users: 4532, status: "active" },
          { id: 5, title: "Apex Legends", users: 2345, status: "active" },
        ])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to fetch real data from API
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUsers(response.data)
        setFilteredUsers(response.data)
      } catch (apiError) {
        console.error("API Error:", apiError)
        // Fallback to mock data if API fails
        const mockUsers = [
          {
            id: 1,
            username: "John Doe",
            email: "john@example.com",
            role: "user",
            createdAt: "2023-05-15",
            status: "active",
          },
          {
            id: 2,
            username: "Jane Smith",
            email: "jane@example.com",
            role: "admin",
            createdAt: "2023-05-14",
            status: "active",
          },
          {
            id: 3,
            username: "Bob Johnson",
            email: "bob@example.com",
            role: "user",
            createdAt: "2023-05-13",
            status: "active",
          },
          {
            id: 4,
            username: "Alice Brown",
            email: "alice@example.com",
            role: "user",
            createdAt: "2023-05-12",
            status: "inactive",
          },
          {
            id: 5,
            username: "Charlie Wilson",
            email: "charlie@example.com",
            role: "moderator",
            createdAt: "2023-05-11",
            status: "active",
          },
          {
            id: 6,
            username: "David Lee",
            email: "david@example.com",
            role: "user",
            createdAt: "2023-05-10",
            status: "active",
          },
          {
            id: 7,
            username: "Eva Garcia",
            email: "eva@example.com",
            role: "user",
            createdAt: "2023-05-09",
            status: "inactive",
          },
          {
            id: 8,
            username: "Frank Miller",
            email: "frank@example.com",
            role: "user",
            createdAt: "2023-05-08",
            status: "active",
          },
          {
            id: 9,
            username: "Grace Taylor",
            email: "grace@example.com",
            role: "moderator",
            createdAt: "2023-05-07",
            status: "active",
          },
          {
            id: 10,
            username: "Henry Wilson",
            email: "henry@example.com",
            role: "user",
            createdAt: "2023-05-06",
            status: "active",
          },
        ]

        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch games
  const fetchGames = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to fetch real data from API
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${API_URL}/admin/games`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setGames(response.data)
        setFilteredGames(response.data)
      } catch (apiError) {
        console.error("API Error:", apiError)
        // Fallback to mock data if API fails
        const mockGames = [
          {
            id: 1,
            title: "Fortnite",
            image: "https://www.giantbomb.com/a/uploads/original/8/87790/2952214-box_fn.png",
            users: 5432,
            status: "active",
            views: 16594,
            rating: 4.2,
          },
          {
            id: 2,
            title: "Valorant",
            image: "https://www.giantbomb.com/a/uploads/original/0/1992/3587046-5466182583-9edb6.jpg",
            users: 3211,
            status: "active",
            views: 6067,
            rating: 4.3,
          },
          {
            id: 3,
            title: "Minecraft",
            image: "https://www.giantbomb.com/a/uploads/original/8/87790/3020660-box_mc.png",
            users: 2876,
            status: "active",
            views: 10500,
            rating: 4.8,
          },
          {
            id: 4,
            title: "League of Legends",
            image: "https://www.giantbomb.com/a/uploads/original/8/87790/3175371-box_lol.png",
            users: 4532,
            status: "active",
            views: 7428,
            rating: 4.1,
          },
          {
            id: 5,
            title: "Apex Legends",
            image: "https://www.giantbomb.com/a/uploads/original/8/87790/3079288-box_al.png",
            users: 2345,
            status: "active",
            views: 449,
            rating: 4.4,
          },
          {
            id: 6,
            title: "PUBG Mobile",
            image: "https://www.giantbomb.com/a/uploads/original/8/87790/3309402-box_pubgbg.png",
            users: 3567,
            status: "active",
            views: 8900,
            rating: 4.2,
          },
          {
            id: 7,
            title: "Roblox",
            image: "https://www.giantbomb.com/a/uploads/original/8/87790/2956731-box_roblox.png",
            users: 6789,
            status: "active",
            views: 12000,
            rating: 4.3,
          },
          {
            id: 8,
            title: "Clash of Clans",
            image:
              "https://www.giantbomb.com/a/uploads/scale_large/15/150889/2347208-fc003520bf87740009010db7c453da78.png",
            users: 4321,
            status: "active",
            views: 9585,
            rating: 4.0,
          },
          {
            id: 9,
            title: "Grand Theft Auto",
            image: "https://www.giantbomb.com/a/uploads/original/20/201266/3532840-6042895878-co2lb.png",
            users: 5678,
            status: "active",
            views: 7578,
            rating: 4.8,
          },
          {
            id: 10,
            title: "Marvel Rivals",
            image: "https://www.giantbomb.com/a/uploads/original/0/1992/3686550-5383796058-libra.jpg",
            users: 1234,
            status: "active",
            views: 410,
            rating: 4.5,
            isNew: true,
          },
        ]

        setGames(mockGames)
        setFilteredGames(mockGames)
      }
    } catch (error) {
      console.error("Error fetching games:", error)
      setError("Failed to load games. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Create or update user
  const handleSaveUser = async (userData) => {
    try {
      const token = localStorage.getItem("token")

      if (selectedUser) {
        // Update existing user
        await axios.put(`${API_URL}/admin/users/${selectedUser.id}`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === selectedUser.id ? { ...user, ...userData } : user)),
        )

        toast({
          title: "Success",
          description: "User updated successfully",
          variant: "success",
        })
      } else {
        // Create new user
        const response = await axios.post(`${API_URL}/admin/users`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Update local state
        setUsers((prevUsers) => [...prevUsers, response.data])

        toast({
          title: "Success",
          description: "User created successfully",
          variant: "success",
        })
      }

      setIsUserFormOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save user",
        variant: "destructive",
      })
    }
  }

  // Create or update game
  const handleSaveGame = async (gameData) => {
    try {
      const token = localStorage.getItem("token")

      if (selectedGame) {
        // Update existing game
        await axios.put(`${API_URL}/admin/games/${selectedGame.id}`, gameData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Update local state
        setGames((prevGames) =>
          prevGames.map((game) => (game.id === selectedGame.id ? { ...game, ...gameData } : game)),
        )

        toast({
          title: "Success",
          description: "Game updated successfully",
          variant: "success",
        })
      } else {
        // Create new game
        const response = await axios.post(`${API_URL}/admin/games`, gameData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Update local state
        setGames((prevGames) => [...prevGames, response.data])

        toast({
          title: "Success",
          description: "Game created successfully",
          variant: "success",
        })
      }

      setIsGameFormOpen(false)
      setSelectedGame(null)
    } catch (error) {
      console.error("Error saving game:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save game",
        variant: "destructive",
      })
    }
  }

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))

      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  // Delete game
  const handleDeleteGame = async (gameId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_URL}/admin/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update local state
      setGames((prevGames) => prevGames.filter((game) => game.id !== gameId))

      toast({
        title: "Success",
        description: "Game deleted successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting game:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete game",
        variant: "destructive",
      })
    }
  }

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token")
      const newStatus = currentStatus === "active" ? "inactive" : "active"

      await axios.patch(
        `${API_URL}/admin/users/${userId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))

      toast({
        title: "Success",
        description: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error toggling user status:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  // Toggle game status
  const toggleGameStatus = async (gameId, currentStatus) => {
    try {
      const token = localStorage.getItem("token")
      const newStatus = currentStatus === "active" ? "inactive" : "active"

      await axios.patch(
        `${API_URL}/admin/games/${gameId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update local state
      setGames((prevGames) => prevGames.map((game) => (game.id === gameId ? { ...game, status: newStatus } : game)))

      toast({
        title: "Success",
        description: `Game ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error toggling game status:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update game status",
        variant: "destructive",
      })
    }
  }

  // Open confirmation dialog
  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
    })
  }

  // Get icon component based on name
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Users":
        return <Users size={24} />
      case "GameController":
        return <GamepadIcon size={24} />
      case "BarChart2":
        return <BarChart2 size={24} />
      default:
        return <Users size={24} />
    }
  }

  // Render dashboard content
  const renderDashboardContent = () => {
    if (loading) {
      return <div className="loading">Loading dashboard data...</div>
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      )
    }

    return (
      <div className="dashboard-content">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={typeof stat.icon === "string" ? getIconComponent(stat.icon) : stat.icon}
              change={stat.change}
            />
          ))}
        </div>

        <div className="dashboard-tables">
          <div className="recent-users">
            <div className="table-header">
              <h2>Recent Users</h2>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("users")}>
                View All
              </Button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="recent-games">
            <div className="table-header">
              <h2>Active Games</h2>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("games")}>
                View All
              </Button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Users</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game) => (
                  <tr key={game.id}>
                    <td>{game.title}</td>
                    <td>{game.users?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${game.status}`}>{game.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Render users management content
  const renderUsersContent = () => {
    if (loading) {
      return <div className="loading">Loading users data...</div>
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      )
    }

    return (
      <div className="users-content">
        <div className="content-header">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <Input
              type="text"
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-actions">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setSelectedUser(null)
                setIsUserFormOpen(true)
              }}
            >
              <Plus size={16} className="mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>{user.status}</span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsUserFormOpen(true)
                          }}
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn toggle"
                          onClick={() => toggleUserStatus(user.id, user.status)}
                          title={user.status === "active" ? "Deactivate User" : "Activate User"}
                        >
                          {user.status === "active" ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() =>
                            openConfirmDialog(
                              "Delete User",
                              `Are you sure you want to delete ${user.username}? This action cannot be undone.`,
                              () => handleDeleteUser(user.id),
                            )
                          }
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {userSearchTerm ? "No users match your search" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Render games management content
  const renderGamesContent = () => {
    if (loading) {
      return <div className="loading">Loading games data...</div>
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Button onClick={fetchGames}>Try Again</Button>
        </div>
      )
    }

    return (
      <div className="games-content">
        <div className="content-header">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <Input
              type="text"
              placeholder="Search games..."
              value={gameSearchTerm}
              onChange={(e) => setGameSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-actions">
            <Button variant="outline" onClick={fetchGames}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setSelectedGame(null)
                setIsGameFormOpen(true)
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Game
            </Button>
          </div>
        </div>

        <div className="games-grid">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <div key={game.id} className="game-card admin">
                <div className="game-image-container">
                  <img src={game.image || "/placeholder.svg"} alt={game.title} className="game-image" />
                  {game.isNew && <span className="new-badge">New</span>}
                  <span className={`status-badge ${game.status}`}>{game.status}</span>
                </div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <div className="game-stats">
                    <div className="views-counter">
                      <svg viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{game.views?.toLocaleString() || 0}</span>
                    </div>
                    {game.rating && (
                      <div className="rating">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{game.rating?.toFixed(1) || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="game-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => {
                      setSelectedGame(game)
                      setIsGameFormOpen(true)
                    }}
                    title="Edit Game"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn toggle"
                    onClick={() => toggleGameStatus(game.id, game.status)}
                    title={game.status === "active" ? "Deactivate Game" : "Activate Game"}
                  >
                    {game.status === "active" ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() =>
                      openConfirmDialog(
                        "Delete Game",
                        `Are you sure you want to delete ${game.title}? This action cannot be undone.`,
                        () => handleDeleteGame(game.id),
                      )
                    }
                    title="Delete Game"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">{gameSearchTerm ? "No games match your search" : "No games found"}</div>
          )}
        </div>
      </div>
    )
  }

  // Render settings content
  const renderSettingsContent = () => {
    return (
      <div className="settings-content">
        <h2>Admin Settings</h2>
        <p>This section will contain admin settings functionality.</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Shield size={24} />
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart2 size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={20} />
            <span>Users</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "games" ? "active" : ""}`}
            onClick={() => setActiveTab("games")}
          >
            <GamepadIcon size={20} />
            <span>Games</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>
            {activeTab === "dashboard" && "Admin Dashboard"}
            {activeTab === "users" && "User Management"}
            {activeTab === "games" && "Game Management"}
            {activeTab === "settings" && "Admin Settings"}
          </h1>
          <div className="admin-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </div>

        {activeTab === "dashboard" && renderDashboardContent()}
        {activeTab === "users" && renderUsersContent()}
        {activeTab === "games" && renderGamesContent()}
        {activeTab === "settings" && renderSettingsContent()}
      </div>

      {/* User Form Dialog */}
      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <UserForm
            user={selectedUser}
            onSave={handleSaveUser}
            onCancel={() => {
              setIsUserFormOpen(false)
              setSelectedUser(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Game Form Dialog */}
      <Dialog open={isGameFormOpen} onOpenChange={setIsGameFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <GameForm
            game={selectedGame}
            onSave={handleSaveGame}
            onCancel={() => {
              setIsGameFormOpen(false)
              setSelectedGame(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[400px]">
          <h2 className="text-xl font-semibold mb-2">{confirmDialog.title}</h2>
          <p className="mb-4">{confirmDialog.message}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmDialog.onConfirm()
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard

