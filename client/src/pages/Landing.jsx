import React, { useEffect, Children } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	Building2Icon,
	AlertCircleIcon,
	CalendarIcon,
	BellIcon,
} from "lucide-react";
import { motion } from "framer-motion";
const fadeIn = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
		},
	},
};
const staggerContainer = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};
export function Landing() {
	const { currentUser } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (currentUser) {
			navigate("/incidents");
		}
	}, [currentUser, navigate]);
	return (
		<div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
			{/* Navigation */}
			<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div className="bg-blue-600 p-1.5 rounded-lg">
							<Building2Icon className="w-5 h-5 text-white" />
						</div>
						<span className="font-semibold text-lg tracking-tight text-slate-900 hidden sm:block">
							Smart Campus Operations Hub
						</span>
						<span className="font-semibold text-lg tracking-tight text-slate-900 sm:hidden">
							SCOH
						</span>
					</div>
					<div className="flex items-center gap-4">
						<Link
							to="/login"
							className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
						>
							Sign In
						</Link>
						<Link
							to="/register"
							className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
						>
							Register
						</Link>
					</div>
				</div>
			</header>

			<main className="flex-grow">
				{/* Hero Section */}
				<section className="relative bg-gradient-to-b from-slate-50 to-blue-50/50 pt-24 pb-32 overflow-hidden">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
						<motion.div
							className="text-center max-w-3xl mx-auto"
							initial="hidden"
							animate="visible"
							variants={staggerContainer}
						>
							<motion.div
								variants={fadeIn}
								className="flex justify-center mb-6"
							>
								<div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
									<Building2Icon className="w-12 h-12 text-blue-600" />
								</div>
							</motion.div>
							<motion.h1
								variants={fadeIn}
								className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6"
							>
								Smart Campus Operations Hub
							</motion.h1>
							<motion.p
								variants={fadeIn}
								className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed"
							>
								Streamline facility management, incident reporting, and resource
								booking across your campus.
							</motion.p>
							<motion.div
								variants={fadeIn}
								className="flex flex-col sm:flex-row items-center justify-center gap-4"
							>
								<Link
									to="/login"
									className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
								>
									Sign In
								</Link>
								<Link
									to="/register"
									className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
								>
									Create Account
								</Link>
							</motion.div>
						</motion.div>
					</div>
				</section>

				{/* Stats Bar */}
				<section className="bg-white border-y border-slate-200">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
							{[
								{
									label: "Resources Managed",
									value: "500+",
								},
								{
									label: "Bookings Processed",
									value: "10,000+",
								},
								{
									label: "Uptime",
									value: "99.9%",
								},
								{
									label: "Support",
									value: "24/7",
								},
							].map((stat, i) => (
								<div key={i} className="text-center">
									<div className="text-3xl font-bold text-slate-900 mb-1">
										{stat.value}
									</div>
									<div className="text-sm font-medium text-slate-500">
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-24 bg-slate-50">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{
								once: true,
								margin: "-100px",
							}}
							variants={fadeIn}
							className="text-center max-w-3xl mx-auto mb-16"
						>
							<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
								Everything you need to manage your campus
							</h2>
							<p className="text-lg text-slate-600">
								A comprehensive suite of tools designed specifically for
								university facility management.
							</p>
						</motion.div>

						<motion.div
							className="grid grid-cols-1 md:grid-cols-3 gap-8"
							initial="hidden"
							whileInView="visible"
							viewport={{
								once: true,
								margin: "-100px",
							}}
							variants={staggerContainer}
						>
							<motion.div
								variants={fadeIn}
								className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
							>
								<div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
									<AlertCircleIcon className="w-6 h-6 text-red-600" />
								</div>
								<h3 className="text-xl font-semibold text-slate-900 mb-3">
									Incident Management
								</h3>
								<p className="text-slate-600 leading-relaxed">
									Report and track maintenance issues, electrical faults,
									plumbing problems and more. Get real-time updates as
									technicians resolve them.
								</p>
							</motion.div>

							<motion.div
								variants={fadeIn}
								className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
							>
								<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
									<CalendarIcon className="w-6 h-6 text-blue-600" />
								</div>
								<h3 className="text-xl font-semibold text-slate-900 mb-3">
									Resource Booking
								</h3>
								<p className="text-slate-600 leading-relaxed">
									Book labs, lecture halls, equipment and meeting rooms. Check
									availability, avoid conflicts, and manage your schedule
									efficiently.
								</p>
							</motion.div>

							<motion.div
								variants={fadeIn}
								className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
							>
								<div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
									<BellIcon className="w-6 h-6 text-amber-600" />
								</div>
								<h3 className="text-xl font-semibold text-slate-900 mb-3">
									Real-time Notifications
								</h3>
								<p className="text-slate-600 leading-relaxed">
									Stay informed with instant notifications for booking
									approvals, ticket updates, and technician assignments.
								</p>
							</motion.div>
						</motion.div>
					</div>
				</section>

				{/* How It Works Section */}
				<section className="py-24 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<motion.div
							initial="hidden"
							whileInView="visible"
							viewport={{
								once: true,
								margin: "-100px",
							}}
							variants={fadeIn}
							className="text-center mb-16"
						>
							<h2 className="text-3xl md:text-4xl font-bold text-slate-900">
								How it works
							</h2>
						</motion.div>

						<motion.div
							className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
							initial="hidden"
							whileInView="visible"
							viewport={{
								once: true,
								margin: "-100px",
							}}
							variants={staggerContainer}
						>
							{/* Connecting line for desktop */}
							<div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-0.5 bg-slate-100 z-0"></div>

							{[
								{
									step: "1",
									title: "Sign in",
									desc: "Sign in with your university account",
								},
								{
									step: "2",
									title: "Take action",
									desc: "Report an issue or book a resource",
								},
								{
									step: "3",
									title: "Stay updated",
									desc: "Get real-time updates and confirmations",
								},
							].map((item, i) => (
								<motion.div
									key={i}
									variants={fadeIn}
									className="relative z-10 flex flex-col items-center text-center"
								>
									<div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-sm ring-8 ring-white">
										{item.step}
									</div>
									<h3 className="text-xl font-semibold text-slate-900 mb-2">
										{item.title}
									</h3>
									<p className="text-slate-600">{item.desc}</p>
								</motion.div>
							))}
						</motion.div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="bg-slate-900 py-12 border-t border-slate-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex items-center gap-2 text-slate-300">
						<Building2Icon className="w-5 h-5" />
						<span className="font-semibold">Smart Campus Operations Hub</span>
					</div>
					<p className="text-slate-400 text-sm">
						© 2026 Smart Campus Operations Hub. All rights reserved.
					</p>
					<div className="flex items-center gap-6 text-sm text-slate-400">
						<a href="#" className="hover:text-white transition-colors">
							Privacy Policy
						</a>
						<a href="#" className="hover:text-white transition-colors">
							Terms of Service
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
