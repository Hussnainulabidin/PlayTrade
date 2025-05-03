# PlayTrade - Game Account Marketplace
https://playtrade-production.up.railway.app

PlayTrade is a comprehensive platform for buying and selling gaming accounts across multiple popular games. The application supports various user roles (admin, seller, client), secure authentication, and real-time communication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Game Account Endpoints](#game-account-endpoints)
  - [Order Endpoints](#order-endpoints)
  - [Wallet Endpoints](#wallet-endpoints)
  - [Ticket Endpoints](#ticket-endpoints)
  - [Chat Endpoints](#chat-endpoints)
- [Frontend Documentation](#frontend-documentation)
  - [User Roles and Access](#user-roles-and-access)
  - [Admin Dashboard](#admin-dashboard)
  - [Seller Dashboard](#seller-dashboard)
  - [Client Dashboard](#client-dashboard)
  - [Game Account Pages](#game-account-pages)
- [Security Features](#security-features)
- [Real-time Features](#real-time-features)
- [License](#license)

## Overview

PlayTrade is a specialized marketplace designed for gamers to buy and sell gaming accounts. The platform supports accounts from multiple games including Valorant, Fortnite, League of Legends, Clash of Clans, and Brawl Stars. The application has a robust user management system with three distinct roles: admin, seller, and client (buyer).

## Features

- **Multi-role User System**: Admin, Seller, and Client roles with different permissions and dashboards
- **Secure Authentication**: Email verification, two-factor authentication, JWT tokens
- **Game Account Marketplace**: List, browse, and purchase gaming accounts for multiple games
- **Order Management**: Complete order lifecycle from purchase to delivery
- **Wallet System**: Virtual wallet for handling transactions
- **Ticket System**: Support ticket creation and management
- **Real-time Chat**: Communication between users, sellers, and admins
- **Responsive Design**: Mobile-friendly interface for all user dashboards
- **Dispute Resolution**: System for handling order disputes

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time communication
- Multer for file uploads

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling

## Project Structure

The project follows a modular architecture with a clear separation between frontend and backend:

### Backend Structure
```
Backend/
├── controllers/   # Business logic handlers
├── models/        # Database schemas
├── routes/        # API endpoint definitions
├── services/      # Additional services (e.g., socket)
├── utils/         # Utility functions
├── configuration/ # Configuration files
├── data/          # Static data files
├── app.js         # Express application setup
└── server.js      # Server entry point
```

### Frontend Structure
```
Frontend/
├── public/        # Static files
├── src/
│   ├── api/       # API integration
│   ├── assets/    # Images and static resources
│   ├── components/# Reusable UI components
│   ├── lib/       # Utility libraries
│   ├── pages/     # Page components
│   │   ├── Admin/ # Admin dashboard pages
│   │   ├── Client/# Client dashboard pages
│   │   ├── Games/ # Game-specific pages
│   │   └── Seller/# Seller dashboard pages
│   ├── services/  # Service integrations
│   ├── utils/     # Utility functions
│   ├── App.jsx    # Main component with routes
│   └── main.jsx   # Application entry point
```

## Installation and Setup

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Hussnainulabidin/PlayTrade.git
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `config.env`:
   ```
   NODE_ENV=development
   PORT=3003
   DATABASE=<mongodb-connection-string>
   DATABASE_PASSWORD=<your-password>
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   EMAIL_USERNAME=<your-email>
   EMAIL_PASSWORD=<your-email-password>
   EMAIL_HOST=<smtp-host>
   EMAIL_PORT=<smtp-port>
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/users/signup` | POST | Register a new user | Public |
| `/users/verify-signup` | POST | Verify email during signup | Public |
| `/users/login` | POST | Login user | Public |
| `/users/verify-2fa` | POST | Verify two-factor code | Public |
| `/users/forgotPassword` | POST | Request password reset | Public |
| `/users/resetPassword/:token` | PATCH | Reset password with token | Public |
| `/users/update-password` | POST | Update current password | Protected |
| `/users/toggle-2fa` | POST | Enable/disable two-factor auth | Protected |
| `/users/logout-all` | POST | Logout from all devices | Protected |

### User Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/users/me` | GET | Get current user data | Protected |
| `/users` | GET | Get all users | Admin |
| `/users` | POST | Create a new user | Admin |
| `/users/getSeller` | GET | Get all sellers | Admin |
| `/users/getSeller/:id` | GET | Get specific seller | Admin |
| `/users/:id` | GET | Get user by ID | Admin |
| `/users/:id` | PATCH | Update user | Admin |
| `/users/:id` | DELETE | Delete user | Admin |
| `/users/profile-picture` | POST | Upload profile picture | Protected |
| `/users/update-notification-prefs` | POST | Update notification settings | Protected |

### Game Account Endpoints

These endpoints follow a similar pattern for each supported game:

#### Valorant Accounts

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/valorant` | GET | Get all accounts | Public |
| `/valorant/:id` | GET | Get account by ID | Public |
| `/valorant` | POST | Create account listing | Seller |
| `/valorant/:id` | PATCH | Update account | Owner/Admin |
| `/valorant/:id` | DELETE | Delete account | Owner/Admin |
| `/valorant/verifyAccount/:id` | PATCH | Verify account | Admin |
| `/valorant/seller/:sellerId` | GET | Get all accounts by seller | Public |

Similar endpoints exist for other supported games:
- `/clashofclans`
- `/leagueoflegends`
- `/fortnite`
- `/brawlstars`

### Order Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/orders` | GET | Get all orders | Admin |
| `/orders/my-orders` | GET | Get user's orders | Protected |
| `/orders/:id` | GET | Get order by ID | Protected |
| `/orders` | POST | Create new order | Protected |
| `/orders/:id` | PATCH | Update order status | Protected |
| `/orders/dispute/:id` | POST | Open dispute for order | Protected |
| `/orders/resolve-dispute/:id` | PATCH | Resolve order dispute | Admin |
| `/orders/seller/:sellerId` | GET | Get seller's orders | Admin/Seller |

### Wallet Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/wallet/balance` | GET | Get user's wallet balance | Protected |
| `/wallet/transactions` | GET | Get user's transactions | Protected |
| `/wallet/deposit` | POST | Add funds to wallet | Protected |
| `/wallet/withdraw` | POST | Request withdrawal | Protected |
| `/wallet/withdraw/approve/:id` | PATCH | Approve withdrawal | Admin |
| `/wallet/withdraw/reject/:id` | PATCH | Reject withdrawal | Admin |

### Ticket Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/tickets` | GET | Get all tickets | Admin |
| `/tickets/my-tickets` | GET | Get user's tickets | Protected |
| `/tickets/:id` | GET | Get ticket by ID | Protected |
| `/tickets` | POST | Create new ticket | Protected |
| `/tickets/:id/reply` | POST | Add reply to ticket | Protected |
| `/tickets/:id/close` | PATCH | Close ticket | Protected/Admin |
| `/tickets/:id/reopen` | PATCH | Reopen ticket | Protected/Admin |

### Chat Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/chats` | GET | Get user's chats | Protected |
| `/chats/:id` | GET | Get chat by ID | Protected |
| `/chats` | POST | Create new chat | Protected |
| `/chats/:id/messages` | GET | Get chat messages | Protected |
| `/chats/:id/messages` | POST | Send message | Protected |
| `/chats/:id/read` | PATCH | Mark chat as read | Protected |

## Frontend Documentation

### User Roles and Access

The platform supports three main user roles:

1. **Admin**:
   - Access to all system features
   - Manage users, listings, orders, and disputes
   - Verify accounts and approve withdrawals
   - Respond to support tickets

2. **Seller**:
   - Create and manage game account listings
   - Process orders and handle customer communications
   - Manage earnings and withdraw funds
   - Create support tickets

3. **Client (Buyer)**:
   - Browse and purchase game accounts
   - Communicate with sellers
   - Create support tickets
   - View order history

### Admin Dashboard

The admin dashboard includes the following sections:

- **Sellers Management**: View and manage seller accounts
- **Orders Management**: Track all orders and handle disputes
- **Tickets**: Respond to support tickets
- **Chat**: Communicate with users
- **Settings**: Configure system settings

### Seller Dashboard

The seller dashboard includes:

- **Accounts Management**: Add, edit, and manage game account listings
- **Orders**: View and process orders
- **Wallet**: Track earnings and request withdrawals
- **Tickets**: Create and manage support tickets
- **Chat**: Communicate with buyers and admins
- **Settings**: Manage account settings

### Client Dashboard

The client dashboard includes:

- **Orders**: View purchase history and order status
- **Chat**: Communicate with sellers and support
- **Tickets**: Create and track support tickets
- **Support**: Get help with accounts or purchases

### Game Account Pages

Each game has dedicated pages for:

- **Browsing Accounts**: Filter and search available accounts
- **Account Details**: View comprehensive account information
- **Purchase Flow**: Secure checkout process
- **Support**: Game-specific support

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: bcrypt password hashing
- **Email Verification**: Required email verification for new accounts
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Protected Routes**: Role-based access control
- **Secure Cookies**: HTTP-only cookies for token storage
- **CORS Protection**: Configured Cross-Origin Resource Sharing

## Real-time Features

The application uses Socket.IO for real-time features:

- **Live Chat**: Instant messaging between users
- **Order Updates**: Real-time notifications for order status changes
- **Alert Notifications**: System alerts and important updates

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
