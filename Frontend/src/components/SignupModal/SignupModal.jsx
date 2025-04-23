"use client"

import { useState } from "react"
import axios from "axios"
import { z } from "zod"
import { Dialog, DialogContent } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X } from "lucide-react"

export function SignupModal({ isOpen, onClose, switchToLogin, onLoginSuccess }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Validation schema using Zod
  const signupSchema = z
    .object({
      username: z.string().min(2, "Username must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })

  const handleSignup = async () => {
    setError(null)

    // Validate input
    const validationResult = signupSchema.safeParse({
      username,
      email,
      password,
      confirmPassword,
    })

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message)
      return
    }

    setLoading(true)
    try {
      // For demo purposes, simulate a successful signup
      if (!email.includes("admin")) {
        localStorage.setItem("token", "user-demo-token")
        onLoginSuccess("user")
        onClose()
        return
      }

      // Try actual API if available
      try {
        const { data } = await axios.post("http://localhost:3003/users/signup", {
          username,
          email,
          password,
          passwordConfirm: confirmPassword,
        })

        // Store token from the response
        localStorage.setItem("token", data.token)

        // Fetch user role from API
        try {
          const userResponse = await axios.get("http://localhost:3003/api/users/me", {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          })

          // Get user role from response
          const userRole = userResponse.data.role || "user"
          onLoginSuccess(userRole)
        } catch (roleError) {
          // If role fetch fails, default to user role
          console.error("Error fetching user role:", roleError)
          onLoginSuccess("user")
        }

        // Close modal after successful signup
        onClose()
      } catch (apiError) {
        // If API call fails, simulate success for demo
        localStorage.setItem("token", "user-demo-token")
        onLoginSuccess("user")
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 bg-[#18191c] border-[#18191c]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Signup Form */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Create Account</h2>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={onClose}
                disabled={loading}
              >
                <X size={16} />
              </Button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#1f2024] border-0 text-white placeholder:text-gray-400 h-11"
                disabled={loading}
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1f2024] border-0 text-white placeholder:text-gray-400 h-11"
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1f2024] border-0 text-white placeholder:text-gray-400 h-11"
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#1f2024] border-0 text-white placeholder:text-gray-400 h-11"
                disabled={loading}
              />
              <Button className="w-full bg-[#3B6EF2] hover:bg-[#2C5AD9] h-11" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>

              <div className="text-center text-gray-400 text-sm mt-4">
                Already have an account?{" "}
                <button className="text-[#3B6EF2] hover:underline" onClick={switchToLogin}>
                  Log in
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Decorative */}
          <div className="hidden md:block relative bg-[#1f2024] rounded-r-lg">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("/images/na.avif")`,
                backgroundPosition: "-100px center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

