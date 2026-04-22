import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiOutlineEye, HiOutlineEyeOff, HiExclamationCircle } from "react-icons/hi";
import OtpInput from "../components/OtpInput";
import { GraduationCapIcon } from "lucide-react";

const API = "http://localhost:8080/api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [cpwVisible, setCpwVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step !== "otp") return;

    setResendTimer(60);
    setCanResend(false);

    const id = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [step]);

  async function handleSendOtp(e) {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setEmailError("");

    try {
      await axios.post(`${API}/forgot-password/send-otp`, {
        email: email.trim().toLowerCase(),
      });
      setStep("otp");
    } catch (err) {
      setEmailError(err.response?.data?.message || "Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }

    setOtpError("");
    setLoading(true);

    try {
      await axios.post(`${API}/forgot-password/verify-otp`, {
        email: email.trim().toLowerCase(),
        otp,
      });
      setStep("newPassword");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;

    setOtpError("");

    try {
      await axios.post(`${API}/forgot-password/send-otp`, {
        email: email.trim().toLowerCase(),
      });
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Could not resend. Please try again.");
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    if (otp.length < 6) {
      setPwError("OTP is missing or invalid. Please verify OTP again.");
      return;
    }

    setPwError("");
    setLoading(true);

    try {
      await axios.post(`${API}/forgot-password/reset`, {
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });
      setStep("done");
    } catch (err) {
      setPwError(err.response?.data?.message || "Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/4 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCapIcon className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold text-white tracking-tight">
          Smart Campus Hub
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-400">
          University Operations Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {step === "email" && (
            <>
              <h3 className="text-xl font-bold text-gray-900 text-center">Forgot password</h3>
              <p className="mt-1 text-sm text-center text-slate-500 mb-6">
                Enter your email to receive an OTP
              </p>

              {emailError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <HiExclamationCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="you@university.edu"
                    autoComplete="email"
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      emailError
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-5"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h3 className="text-xl font-bold text-gray-900 text-center">Verify OTP</h3>
              <p className="mt-1 text-sm text-center text-slate-500 mb-6">
                Enter the code sent to <span className="font-medium text-slate-700">{email}</span>
              </p>

              {otpError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <HiExclamationCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="mb-6">
                <OtpInput length={6} onChange={setOtp} hasError={!!otpError} />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-center mt-4 text-sm text-slate-500">
                Didn&apos;t receive it?{" "}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend in {resendTimer}s</span>
                )}
              </p>

              <button
                onClick={() => setStep("email")}
                className="mt-3 block mx-auto text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change email
              </button>
            </>
          )}

          {step === "newPassword" && (
            <>
              <h3 className="text-xl font-bold text-gray-900 text-center">Create new password</h3>
              <p className="mt-1 text-sm text-center text-slate-500 mb-6">
                Choose a strong password for your account
              </p>

              {pwError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <HiExclamationCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{pwError}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={pwVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPwError("");
                      }}
                      placeholder="Min. 8 characters"
                      className={`w-full pr-11 px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        pwError
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setPwVisible((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {pwVisible ? (
                        <HiOutlineEyeOff className="h-4 w-4" />
                      ) : (
                        <HiOutlineEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={cpwVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPwError("");
                      }}
                      placeholder="Repeat new password"
                      className={`w-full pr-11 px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        pwError
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setCpwVisible((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {cpwVisible ? (
                        <HiOutlineEyeOff className="h-4 w-4" />
                      ) : (
                        <HiOutlineEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-5"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <>
              <h3 className="text-xl font-bold text-gray-900 text-center">Password updated</h3>
              <p className="mt-1 text-sm text-center text-slate-500 mb-6">
                Your password has been changed successfully
              </p>

              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Go to sign in
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
