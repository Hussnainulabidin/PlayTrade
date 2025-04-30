"use client";

import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import AuthService from "../AuthService/AuthService";
import { useUser } from '../userContext/UserContext';
import { TwoFactorVerification } from "./TwoFactorVerification";

export function LoginModal({
  isOpen,
  onClose,
  switchToSignup,
  onLoginSuccess,
}) {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [userId, setUserId] = useState(null);

  // Validation schema using Zod
  const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const handleLogin = async () => {
    setError(null);

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.login(email, password);
      
      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        setUserId(response.userId);
        setTwoFactorRequired(true);
        setLoading(false);
        return;
      }
      
      if (response) {
        await login(response);
        onLoginSuccess(response);
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login(email, password);
      
      if (response.requiresTwoFactor) {
        setUserId(response.userId);
        return { success: true, message: "A new verification code has been sent to your email" };
      } else {
        throw new Error("Failed to send verification code");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend verification code.";
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setTwoFactorRequired(false);
    setUserId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 bg-[#18191c] border-[#18191c]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Login Form or 2FA Verification */}
          {twoFactorRequired ? (
            <TwoFactorVerification 
              userId={userId}
              onVerifySuccess={(userData) => {
                onLoginSuccess(userData);
                onClose();
              }}
              onResendCode={handleResendCode}
              onCancel={handleCancel}
            />
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Login</h2>
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
                <Button
                  className="w-full bg-[#3B6EF2] hover:bg-[#2C5AD9] h-11"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center text-gray-400 text-sm mt-4">
                  Don't have an account?{" "}
                  <button
                    className="text-[#3B6EF2] hover:underline"
                    onClick={switchToSignup}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right side - Decorative */}
          <div className="hidden md:block relative bg-[#1f2024] rounded-r-lg">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("/images/na.avif")`,
                backgroundPosition: "-20px center",
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