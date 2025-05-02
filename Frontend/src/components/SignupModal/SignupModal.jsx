"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { Dialog, DialogContent } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X } from "lucide-react"
import { useUser } from "../userContext/UserContext"
import { userApi } from "../../api"

export function SignupModal({ isOpen, onClose, switchToLogin, onLoginSuccess }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState("signup") // "signup" or "verification"
  const [userId, setUserId] = useState(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const { login, initializeAuth } = useUser()

  // Countdown for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && step === "verification") {
      setCanResend(true)
    }
  }, [countdown, step])

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
      // Send signup request to API
      const response = await userApi.signup({
        username,
        email,
        password,
        passwordConfirm: confirmPassword,
      })
      
      if (response.data.status === "success") {
        if (response.data.requiresTwoFactor) {
          // If 2FA is required, store the user ID and show verification form
          setUserId(response.data.userId)
          setStep("verification")
          // Start countdown for resend code (60 seconds)
          setCountdown(60)
          setCanResend(false)
        } else {
          // This branch shouldn't be reached with your current backend flow,
          // but kept for future flexibility if direct signup is enabled
          if (response.data.token) {
            // Get user data from the response
            const userData = response.data.data.user
            
            // Add token to userData
            userData.token = response.data.token
            
            // Login through the context (this handles setting localStorage items)
            await login(userData)
            
            // Call onLoginSuccess with the user data
            onLoginSuccess(userData)
          }
          onClose()
        }
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.response?.data?.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  const handleResendCode = async () => {
    if (!canResend) return
    
    setError(null)
    setLoading(true)
    setCanResend(false)
    
    try {
      const response = await userApi.resendVerification({
        username,
        email,
        password
      })
      
      if (response.data.status === "success") {
        // Update user ID in case it changed
        setUserId(response.data.userId)
        setCountdown(60)
        setError(null)
      }
    } catch (err) {
      console.error("Code resend error:", err)
      setError(err.response?.data?.message || "Failed to resend code. Please try again.")
      setCanResend(true)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError(null)
    
    if (!verificationCode || verificationCode.trim() === "") {
      setError("Please enter the verification code")
      return
    }
    
    setLoading(true)
    try {
      // Verify the 2FA code
      const response = await userApi.verifySignup({
        userId: userId,
        verificationCode: verificationCode
      })
      
      console.log("Verification response:", response.data)
      
      if (response.data.status === "success") {
        // Get token and user data from response
        const { token, data } = response.data
        
        if (!token) {
          console.error("No token received from server after verification")
          setError("Authentication error. Please try again.")
          return
        }
        
        const userData = data.user
        
        // Add token to userData
        userData.token = token
        
        // Login through the context (this handles setting localStorage items)
        await login(userData)
        
        // Call onLoginSuccess with the user data
        onLoginSuccess(userData)
        
        // Close modal
        onClose()
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError(err.response?.data?.message || "Invalid verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderSignupForm = () => (
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
      <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] h-11" onClick={handleSignup} disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </Button>

      <div className="text-center text-gray-400 text-sm mt-4">
        Already have an account?{" "}
        <button className="text-[#3B6EF2] hover:underline" onClick={switchToLogin}>
          Log in
        </button>
      </div>
    </div>
  )
  
  const renderVerificationForm = () => (
    <div className="space-y-4">
      <p className="text-gray-300 text-sm mb-4">
        We've sent a verification code to <span className="font-semibold">{email}</span>. Please enter it below to complete your registration.
      </p>
      <Input
        type="text"
        placeholder="Verification Code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        className="bg-[#1f2024] border-0 text-white placeholder:text-gray-400 h-11"
        disabled={loading}
      />
      <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] h-11" onClick={handleVerifyCode} disabled={loading}>
        {loading ? "Verifying..." : "Verify Code"}
      </Button>
      
      <div className="text-center text-gray-400 text-sm mt-4">
        Didn't receive the code?{" "}
        {countdown > 0 ? (
          <span>Resend in {countdown}s</span>
        ) : (
          <button 
            className="text-[#3B6EF2] hover:underline" 
            onClick={handleResendCode}
            disabled={!canResend || loading}
          >
            Resend code
          </button>
        )}
      </div>
      
      <div className="text-center text-gray-400 text-sm">
        <button 
          className="text-[#3B6EF2] hover:underline" 
          onClick={() => setStep("signup")}
          disabled={loading}
        >
          Back to signup
        </button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 bg-[#18191c] border-[#18191c]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Signup Form */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {step === "signup" ? "Create Account" : "Verify Email"}
              </h2>
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
            
            {step === "signup" ? renderSignupForm() : renderVerificationForm()}
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

