import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createIncident, uploadAttachments } from "../../services/incidents";
import { getAllResources } from "../../api/ResourceAPI";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { UploadIcon, XIcon, ArrowLeftIcon } from "lucide-react";
import { motion } from "framer-motion";

export function CreateIncident() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [loading, setLoading] = useState(false);
	const [resources, setResources] = useState([]);
	const [files, setFiles] = useState([]);
	const [errors, setErrors] = useState({});
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		location: "",
		category: "OTHER",
		priority: "LOW",
		preferredContact: "",
		resourceId: "",
	});

	// Fetch real resources when the component mounts
	useEffect(() => {
		const fetchResources = async () => {
			try {
				const response = await getAllResources();
				// Extract .data because your service returns the raw Axios response
				setResources(response.data);
			} catch (error) {
				console.error("Failed to load resources for dropdown:", error);
				toast.error("Could not load resources list.");
			}
		};
		fetchResources();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		if (files.length + selectedFiles.length > 3) {
			toast.error("Maximum 3 images allowed");
			return;
		}
		const validFiles = selectedFiles.filter((file) =>
			["image/jpeg", "image/png", "image/webp"].includes(file.type),
		);
		if (validFiles.length !== selectedFiles.length) {
			toast.error("Only JPEG, PNG, and WebP images are allowed");
		}
		setFiles((prev) => [...prev, ...validFiles].slice(0, 3));
	};

	const removeFile = (index) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.title.trim()) newErrors.title = "Title is required";
		if (!formData.description.trim())
			newErrors.description = "Description is required";
		if (!formData.location.trim()) newErrors.location = "Location is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		try {
			const payload = { ...formData };
			if (!payload.resourceId) {
				payload.resourceId = null;
			}

			const incident = await createIncident(payload);

			if (files.length > 0) {
				await uploadAttachments(incident.id, files);
			}

			toast.success("Incident reported successfully");
			navigate(`/incidents/${incident.id}`);
		} catch (error) {
			console.error("Failed to submit incident:", error);
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				"Failed to report incident. Please try again.";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<button
				onClick={() => navigate("/incidents")}
				className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
			>
				<ArrowLeftIcon className="h-4 w-4 mr-1" />
				Back to Incidents
			</button>

			<div>
				<h1 className="text-2xl font-bold text-gray-900">Report an Incident</h1>
				<p className="mt-1 text-sm text-gray-500">
					Please provide detailed information about the issue so our team can
					respond quickly.
				</p>
			</div>

			<motion.form
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				onSubmit={handleSubmit}
				className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden"
			>
				<div className="p-6 space-y-5">
					{/* Title */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Title <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200"}`}
							placeholder="Brief summary of the issue"
						/>
						{errors.title && (
							<p className="text-xs text-red-500 mt-1">{errors.title}</p>
						)}
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description <span className="text-red-500">*</span>
						</label>
						<textarea
							name="description"
							rows="4"
							value={formData.description}
							onChange={handleChange}
							className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.description ? "border-red-300 bg-red-50" : "border-gray-200"}`}
							placeholder="Detailed description of what happened or what is broken"
						/>
						{errors.description && (
							<p className="text-xs text-red-500 mt-1">{errors.description}</p>
						)}
					</div>

					{/* Location + Contact */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Location <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="location"
								value={formData.location}
								onChange={handleChange}
								className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.location ? "border-red-300 bg-red-50" : "border-gray-200"}`}
								placeholder="e.g., Building A, Room 101"
							/>
							{errors.location && (
								<p className="text-xs text-red-500 mt-1">{errors.location}</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Preferred Contact
							</label>
							<input
								type="text"
								name="preferredContact"
								value={formData.preferredContact}
								onChange={handleChange}
								className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
								placeholder="Phone number or email"
							/>
						</div>
					</div>

					{/* Category + Priority */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Category
							</label>
							<select
								name="category"
								value={formData.category}
								onChange={handleChange}
								className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							>
								<option value="ELECTRICAL">Electrical</option>
								<option value="PLUMBING">Plumbing</option>
								<option value="IT">IT</option>
								<option value="EQUIPMENT">Equipment</option>
								<option value="STRUCTURAL">Structural</option>
								<option value="OTHER">Other</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Priority
							</label>
							<select
								name="priority"
								value={formData.priority}
								onChange={handleChange}
								className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
							>
								<option value="LOW">Low — Minor inconvenience</option>
								<option value="MEDIUM">
									Medium — Affects daily operations
								</option>
								<option value="HIGH">High — Significant impact</option>
								<option value="CRITICAL">
									Critical — Safety hazard or emergency
								</option>
							</select>
						</div>
					</div>

					{/* Real Backend Resources */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Related Resource (optional)
						</label>
						<select
							name="resourceId"
							value={formData.resourceId}
							onChange={handleChange}
							className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
						>
							<option value="">None</option>
							{resources.map((r) => {
								// Catch the ID regardless of how Spring Boot serializes it
								const actualId = r.id || r.resourceId || r.resourceID;
								return (
									<option key={actualId} value={actualId}>
										{r.name} {r.location ? `— ${r.location}` : ""}
									</option>
								);
							})}
						</select>
					</div>

					{/* File upload */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Attachments <span className="text-gray-400">(Max 3 images)</span>
						</label>
						<div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
							<div className="space-y-2 text-center">
								<UploadIcon className="mx-auto h-10 w-10 text-gray-300" />
								<div className="flex text-sm text-gray-500 justify-center">
									<label
										htmlFor="file-upload"
										className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500"
									>
										<span>Upload files</span>
										<input
											id="file-upload"
											type="file"
											className="sr-only"
											multiple
											accept="image/jpeg,image/png,image/webp"
											onChange={handleFileChange}
											disabled={files.length >= 3}
										/>
									</label>
									<span className="pl-1">or drag and drop</span>
								</div>
								<p className="text-xs text-gray-400">
									PNG, JPG, WebP up to 5MB each
								</p>
							</div>
						</div>

						{files.length > 0 && (
							<div className="mt-4 grid grid-cols-3 gap-4">
								{files.map((file, index) => (
									<div
										key={index}
										className="relative group rounded-lg overflow-hidden border border-gray-200"
									>
										<img
											src={URL.createObjectURL(file)}
											alt={`Preview ${index}`}
											className="h-28 w-full object-cover"
										/>
										<button
											type="button"
											onClick={() => removeFile(index)}
											className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
										>
											<XIcon className="h-3 w-3" />
										</button>
										<div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
											<p className="text-[10px] text-white truncate">
												{file.name}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
					<button
						type="button"
						onClick={() => navigate("/incidents")}
						className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
					>
						{loading ? (
							<>
								<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Submitting...
							</>
						) : (
							"Submit Ticket"
						)}
					</button>
				</div>
			</motion.form>
		</div>
	);
}
