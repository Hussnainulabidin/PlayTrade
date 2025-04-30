"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import AuthService from "../AuthService/AuthService";
import { useUser } from '../userContext/UserContext';

export function TwoFactorVerification({
  userId,
  onVerifySuccess,
  onResendCode,
  onCancel
}) {
  const { login } = useUser();
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Timer for code expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Enable resend after 60 seconds
    const resendTimer = setTimeout(() => {
      setCanResend(true);
    }, 60000);

    return () => {
      clearInterval(timer);
      clearTimeout(resendTimer);
    };
  }, []);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const userData = await AuthService.verifyTwoFactorCode(userId, verificationCode);
      if (userData) {
        await login(userData);
        onVerifySuccess(userData);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Verification failed. Please check your code and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setTimeLeft(300); // Reset the timer
    setLoading(true);
    
    // Wait 60 seconds before allowing resend again
    setTimeout(() => {
      setCanResend(true);
    }, 60000);
    
    const result = await onResendCode();
    setLoading(false);
    
    if (result) {
      if (result.success) {
        setError(null);
        // Show success message temporarily in green
        const successElement = document.createElement('p');
        successElement.className = 'text-green-500 text-sm mb-4';
        successElement.textContent = result.message;
        const container = document.querySelector('.space-y-4');
        if (container) {
          container.prepend(successElement);
          setTimeout(() => {
            successElement.remove();
          }, 5000);
        }
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Two-Factor Authentication</h2>
      </div>

      <p className="text-gray-300 mb-4">
        A verification code has been sent to your email. Please enter the 6-digit code below to continue.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="6-digit verification code"
          value={verificationCode}
          onChange={(e) => {
            // Only allow numbers and limit to 6 digits
            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
            setVerificationCode(value);
          }}
          className="bg-[#1f2024] border-0 text-white placeholder:text-gray-400 h-11 text-center text-lg letter-spacing-wide"
          disabled={loading}
          maxLength={6}
        />

        <div className="text-center text-sm text-gray-400">
          Code expires in {formatTime(timeLeft)}
        </div>

        <Button
          className="w-full bg-[#3B6EF2] hover:bg-[#2C5AD9] h-11"
          onClick={handleVerify}
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? "Verifying..." : "Verify & Login"}
        </Button>

        <div className="flex justify-between mt-4">
          <button
            className={`text-sm ${canResend ? 'text-[#3B6EF2] hover:underline' : 'text-gray-600 cursor-not-allowed'}`}
            onClick={handleResend}
            disabled={!canResend || loading}
          >
            {canResend ? "Resend Code" : "Resend Code (wait)"}
          </button>
          <button
            className="text-gray-400 text-sm hover:text-white"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 