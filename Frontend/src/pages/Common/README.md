# Chat Component System

This directory contains the unified chat component system for the PlayTrade application.

## Overview

The chat system has been unified across all user types (admin, seller, and client) to ensure consistent functionality and a unified codebase. This approach eliminates code duplication and ensures that any changes or improvements to the chat functionality are automatically applied to all user types.

## Components

- **CommonChatPage.jsx**: The main chat component that handles all chat functionality. It uses the socketService for real-time communication and provides consistent UI across all user types.

## Usage

Each user type has a specific wrapper component that uses CommonChatPage:

- **AdminDashboardChatPage.jsx**: Admin-specific chat page
- **SellerDashboardChatPage.jsx**: Seller-specific chat page
- **ClientChatPage.jsx**: Client-specific chat page

Each wrapper passes the appropriate `userType` prop to CommonChatPage.

## Key Features

- Real-time messaging using WebSockets
- Fallback to REST API if WebSocket connection fails
- Typing indicators
- Message history
- Unread message indicators
- Chat filtering by type (orders, tickets, all)
- Search functionality
- Responsive design

## Dependencies

- socketService from `../../services`
- React hooks (useState, useEffect, useRef)
- useUser context from `../../components/userContext/UserContext`
- UI components from Lucide and custom UI components

## Socket Events

The component listens for the following socket events:
- connect
- disconnect
- newMessage
- userTyping

And emits:
- joinChat
- leaveChat
- sendMessage
- typing 