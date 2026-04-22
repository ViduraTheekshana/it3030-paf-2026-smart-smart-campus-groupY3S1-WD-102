import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { emailLogin, googleLogin, getCurrentUser } from "../services/auth";
import { toast } from "sonner";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../config/firebase";
import {
	GraduationCapIcon,
	MailIcon,
	LockIcon,
	EyeIcon,
	EyeOffIcon,
	LogInIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export function Login() {
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [facebookLoading, setFacebookLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState({});
	const { login, user } = useAuth();
	const navigate = useNavigate();

	
	const redirectAfterLogin = (userData) => {
		if (userData?.role === "ROLE_ADMIN") {
			navigate("/userdashboard");
		} else {
			navigate("/profile");
		}
	};

	const validate = () => {
		const newErrors = {};
		if (!email.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(email))
			newErrors.email = "Enter a valid email";
		if (!password) newErrors.password = "Password is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleEmailLogin = async (e) => {
		e.preventDefault();

		if (!validate()) return;

		setLoading(true);
		try {
			const response = await emailLogin(email.trim().toLowerCase(), password);

			if (response.message === "Login successful" || response) {
				try {
					const userData = await getCurrentUser();
					login(userData);
					toast.success("Welcome back!");
					redirectAfterLogin(userData);
				} catch (profileError) {
					console.error(
						"Failed to fetch user profile after login:",
						profileError,
					);
					toast.error("Logged in, but failed to load user profile.");
				}
			}
		} catch (error) {
			console.error("Login error:", error);
			const message =
				error.response?.data?.message ||
				error.response?.data?.error ||
				"Invalid email or password";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setGoogleLoading(true);
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const idToken = await result.user.getIdToken();

			await googleLogin(idToken);

			const userData = await getCurrentUser();
			login(userData);
			toast.success("Successfully logged in with Google");
			redirectAfterLogin(userData);
		} catch (error) {
			console.error("Google Login Error:", error);

			if (error.code !== "auth/popup-closed-by-user") {
				toast.error("Failed to sign in with Google");
			}
		} finally {
			setGoogleLoading(false);
		}
	};

	const handleFacebookLogin = async () => {
		setFacebookLoading(true);
		try {
			const result = await signInWithPopup(auth, facebookProvider);
			const idToken = await result.user.getIdToken();

			await googleLogin(idToken);

			const userData = await getCurrentUser();
			login(userData);
			toast.success("Successfully logged in with Facebook");
			redirectAfterLogin(userData);
		} catch (error) {
			console.error("Facebook Login Error:", error);

			if (error.code !== "auth/popup-closed-by-user") {
				toast.error("Failed to sign in with Facebook");
			}
		} finally {
			setFacebookLoading(false);
		}
	};

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
					<form onSubmit={handleEmailLogin} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1.5"
							>
								Email address
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
									<MailIcon className="h-4 w-4 text-gray-400" />
								</div>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (errors.email)
											setErrors((prev) => ({
												...prev,
												email: undefined,
											}));
									}}
									placeholder="you@university.edu"
									autoComplete="email"
									className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
										errors.email
											? "border-red-300 bg-red-50"
											: "border-gray-200 bg-gray-50 hover:border-gray-300"
									}`}
								/>
							</div>
							{errors.email && (
								<p className="mt-1 text-xs text-red-500">{errors.email}</p>
							)}
						</div>

						<div>
							<div className="flex items-center justify-between mb-1.5">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									Password
								</label>
								<Link
									to="/forgot-password"
									className="text-xs font-medium text-blue-600 hover:text-blue-700"
								>
									Forgot password?
								</Link>
							</div>

							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
									<LockIcon className="h-4 w-4 text-gray-400" />
								</div>
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										if (errors.password)
											setErrors((prev) => ({
												...prev,
												password: undefined,
											}));
									}}
									placeholder="Enter your password"
									autoComplete="current-password"
									className={`w-full pl-10 pr-11 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
										errors.password
											? "border-red-300 bg-red-50"
											: "border-gray-200 bg-gray-50 hover:border-gray-300"
									}`}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showPassword ? (
										<EyeOffIcon className="h-4 w-4" />
									) : (
										<EyeIcon className="h-4 w-4" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-xs text-red-500">{errors.password}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={loading || googleLoading || facebookLoading}
							className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-5"
						>
							{loading ? (
								<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>
									<LogInIcon className="h-4 w-4" />
									Sign in
								</>
							)}
						</button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="px-3 bg-white text-gray-400 uppercase tracking-wider font-medium">
								or continue with
							</span>
						</div>
					</div>

					<button
						onClick={handleGoogleLogin}
						disabled={loading || googleLoading || facebookLoading}
						className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						{googleLoading ? (
							<div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
						) : (
							<>
								<svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								Sign in with Google
							</>
						)}
					</button>

					<button
						onClick={handleFacebookLogin}
						disabled={loading || googleLoading || facebookLoading}
						className="w-full mt-3 flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						{facebookLoading ? (
							<div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
						) : (
							<>
								<svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
									<path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.019 4.388 10.999 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953h-1.514c-1.492 0-1.956.926-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.072 24 18.092 24 12.073z" />
								</svg>
								Sign in with Facebook
							</>
						)}
					</button>

					<p className="mt-6 text-center text-sm text-slate-500">
						Don&apos;t have an account?{" "}
						<Link
							to="/register"
							className="font-semibold text-blue-600 hover:text-blue-700"
						>
							Create account
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
