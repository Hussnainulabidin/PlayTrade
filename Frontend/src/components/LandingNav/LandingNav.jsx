"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Crown, ChevronDown, User, Gamepad2 } from "lucide-react"

function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-800 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-8">
            <Crown className="h-6 w-6 text-blue-500" />
            <span className="ml-2 text-xl font-bold">
              <span className="text-blue-500">PLAY</span>TRADE
            </span>
          </div>
          <div className="hidden md:flex items-center bg-[#1a2234] rounded-md px-3 py-2">
            <button className="flex items-center text-sm">
              <Gamepad2 className="h-5 w-5 mr-2 text-gray-400" />
              Select Game
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <div className="hidden md:flex items-center mr-4">
            <img
              src="https://via.placeholder.com/24"
              width={24}
              height={24}
              alt="English"
              className="rounded-full mr-2"
            />
            <span className="text-sm">English</span>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-sm">USD</span>
          </div>
          <Link to="/dashboard" className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Dashboard
          </Link>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-4">
            <User className="h-5 w-5 text-gray-300" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default LandingNav

