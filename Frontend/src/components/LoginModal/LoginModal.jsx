"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";

export function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 bg-[#18191c] border-[#18191c]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Login Form */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Login</h2>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Don't have an account?{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Create one here
              </a>
            </p>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              <Button
                variant="outline"
                className="bg-[#5865F2] hover:bg-[#4752C4] border-0 p-2"
              >
                <img src="/discord.svg" alt="Discord" className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-100 border-0 p-2"
              >
                <img src="/google.svg" alt="Google" className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="bg-[#2A475E] hover:bg-[#1B2838] border-0 p-2"
              >
                <img src="/steam.svg" alt="Steam" className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="bg-[#1877F2] hover:bg-[#0C63D4] border-0 p-2"
              >
                <img src="/facebook.svg" alt="Facebook" className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="bg-[#6441A4] hover:bg-[#4B367C] border-0 p-2"
              >
                <img src="/twitch.svg" alt="Twitch" className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#18191c] px-2 text-gray-400">
                  Or Login With Email
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1f2024] border-0 text-white placeholder:text-gray-400 h-11"
              />
              <Button className="w-full bg-[#3B6EF2] hover:bg-[#2C5AD9] h-11">
                Continue with Email
              </Button>
            </div>
          </div>

          {/* Right side - Decorative */}
          <div className="hidden md:block relative bg-[#1f2024] rounded-r-lg">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("images/na.avif")`,
                backgroundPosition: "-20px center", // Moves image 20px to the left
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
