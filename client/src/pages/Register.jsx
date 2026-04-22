import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiExclamationCircle,
} from "react-icons/hi";
import { GraduationCapIcon } from "lucide-react";
import { motion } from "framer-motion";

const API = "http://localhost:8080/api/auth";

function validateEmail(email) {
  const lower = email.trim().toLowerCase();
  if (!lower) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)) {
    return "Enter a valid email address.";
  }
  return null;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [cpwVisible, setCpwVisible] = useState(false);

  function setField(key) {
    return (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: null }));
      setServerError("");
    };
  }

  function validate() {
    const e = {};

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!fullName) e.fullName = "Full name is required.";
    else if (fullName.length < 3) e.fullName = "Full name must be at least 3 characters.";

    const emailErr = validateEmail(email);
    if (emailErr) e.email = emailErr;

    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";

    if (!confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }

    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await axios.post(
        `${API}/register`,
        {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      // IMPORTANT: do not log in after register
      navigate("/login");
    } catch (err) {
      const apiError = err.response?.data;

      if (apiError?.validationErrors) {
        setErrors((prev) => ({
          ...prev,
          fullName: apiError.validationErrors.fullName || null,
          email: apiError.validationErrors.email || null,
          password: apiError.validationErrors.password || null,
          confirmPassword: apiError.validationErrors.confirmPassword || null,
        }));
      }

      setServerError(apiError?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (key) =>
    `w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
      errors[key]
        ? "border-red-300 bg-red-50"
        : "border-gray-200 bg-gray-50 hover:border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <h3 className="text-xl font-bold text-gray-900 text-center">Create account</h3>
          <p className="mt-1 text-sm text-center text-slate-500 mb-6">
            Enter your details to register
          </p>

          {serverError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <HiExclamationCircle className="h-4 w-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineUser className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  className={inputClass("fullName")}
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={setField("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineMail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  className={inputClass("email")}
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={setField("email")}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={pwVisible ? "text" : "password"}
                  className={`${inputClass("password")} pr-11`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={setField("password")}
                  autoComplete="new-password"
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={cpwVisible ? "text" : "password"}
                  className={`${inputClass("confirmPassword")} pr-11`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={setField("confirmPassword")}
                  autoComplete="new-password"
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
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-5"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
