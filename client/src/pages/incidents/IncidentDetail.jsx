import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	getIncidentById,
	updateIncident,
	updateIncidentStatus,
	assignIncident,
	deleteIncident,
} from "../../services/incidents";
import {
	addComment,
	deleteComment,
	editComment,
} from "../../services/comments";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import {
	MapPinIcon,
	ClockIcon,
	UserIcon,
	ArrowLeftIcon,
	MessageSquareIcon,
	TrashIcon,
	PencilIcon,
	PhoneIcon,
	TagIcon,
	WrenchIcon,
	ImageIcon,
	UploadIcon,
	XIcon,
} from "lucide-react";
import { SlaTimer } from "../../components/common/SlaTimer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SecureAttachment from "../../components/SecureAttachment";
import { getTechnicians } from "../../services/user";

export function IncidentDetail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();

	const currentUserId = user?.userId || user?.id;
	const role = user?.role;
	const isAdmin = role === "ROLE_ADMIN";
	const isTechnician = role === "ROLE_TECHNICIAN";

	const [incident, setIncident] = useState(null);
	const [loading, setLoading] = useState(true);

	const [commentText, setCommentText] = useState("");
	const [submittingComment, setSubmittingComment] = useState(false);
	const [editingComment, setEditingComment] = useState(null);
	const [editCommentText, setEditCommentText] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState({
		isOpen: false,
		commentId: null,
	});

	const [deleteTicketConfirm, setDeleteTicketConfirm] = useState(false);
	const [deletingTicket, setDeletingTicket] = useState(false);

	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({});
	const [savingEdit, setSavingEdit] = useState(false);

	const [statusDialog, setStatusDialog] = useState({
		isOpen: false,
		status: "",
	});
	const [statusNotes, setStatusNotes] = useState("");
	const [assignDropdown, setAssignDropdown] = useState(false);
	const [files, setFiles] = useState([]);

	const [technicians, setTechnicians] = useState([]);

	const fetchIncident = async () => {
		try {
			const data = await getIncidentById(id);
			setIncident(data);
		} catch (error) {
			toast.error("Incident not found");
			navigate("/incidents");
		} finally {
			setLoading(false);
		}
	};

	const loadTechnicians = async () => {
		if (isAdmin) {
			try {
				const techs = await getTechnicians();
				const formattedTechs = techs.map((t) => ({
					id: t.id || t.userId,
					name: t.fullName,
					role: "Technician",
				}));
				setTechnicians(formattedTechs);
			} catch (error) {
				toast.error("Failed to load technicians for assignment");
			}
		}
	};

	useEffect(() => {
		fetchIncident();
		loadTechnicians();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, role]);

	const handleDeleteTicket = async () => {
		setDeletingTicket(true);
		try {
			await deleteIncident(id);
			toast.success("Ticket deleted successfully");
			navigate("/incidents");
		} catch (error) {
			const message =
				error.response?.data?.message || "Failed to delete ticket";
			toast.error(message);
		} finally {
			setDeletingTicket(false);
			setDeleteTicketConfirm(false);
		}
	};

	const startEditing = () => {
		setEditForm({
			title: incident.title,
			description: incident.description,
			location: incident.location,
			category: incident.category,
			priority: incident.priority,
			preferredContact: incident.preferredContact || "",
		});
		setIsEditing(true);
	};

	const handleSaveEdit = async () => {
		if (
			!editForm.title?.trim() ||
			!editForm.description?.trim() ||
			!editForm.location?.trim()
		) {
			toast.error("Title, description and location are required.");
			return;
		}
		setSavingEdit(true);
		try {
			await updateIncident(id, editForm);
			toast.success("Incident updated successfully");
			setIsEditing(false);
			fetchIncident();
		} catch (error) {
			toast.error("Failed to update incident");
		} finally {
			setSavingEdit(false);
		}
	};

	const handleStatusUpdate = async () => {
		try {
			const isRejection = statusDialog.status === "REJECTED";
			await updateIncidentStatus(
				id,
				statusDialog.status,
				isRejection ? undefined : statusNotes || undefined,
				isRejection ? statusNotes : undefined,
			);
			toast.success(
				`Status updated to ${statusDialog.status.replace(/_/g, " ")}`,
			);
			fetchIncident();
		} catch (error) {
			toast.error("Failed to update status");
		} finally {
			setStatusDialog({ isOpen: false, status: "" });
			setStatusNotes("");
		}
	};

	const handleAssign = async (techId) => {
		try {
			await assignIncident(id, techId);
			toast.success("Ticket successfully assigned");
			setAssignDropdown(false);
			fetchIncident();
		} catch (error) {
			toast.error("Failed to assign incident");
			setAssignDropdown(false);
		}
	};

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (!commentText.trim()) return;
		setSubmittingComment(true);
		try {
			await addComment(id, commentText);
			setCommentText("");
			fetchIncident();
			toast.success("Comment added");
		} catch (error) {
			toast.error("Failed to add comment");
		} finally {
			setSubmittingComment(false);
		}
	};

	const handleEditComment = async (commentId) => {
		if (!editCommentText.trim()) return;
		try {
			await editComment(id, commentId, editCommentText);
			fetchIncident();
			setEditingComment(null);
			setEditCommentText("");
			toast.success("Comment updated");
		} catch (error) {
			toast.error("Failed to update comment");
		}
	};

	const handleDeleteComment = async (commentId) => {
		try {
			await deleteComment(id, commentId);
			fetchIncident();
			toast.success("Comment deleted");
		} catch (error) {
			toast.error("Failed to delete comment");
		}
		setDeleteConfirm({ isOpen: false, commentId: null });
	};

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		const currentCount = (incident?.attachments?.length || 0) + files.length;
		if (currentCount + selectedFiles.length > 3) {
			toast.error("Maximum 3 images allowed");
			return;
		}
		const validFiles = selectedFiles.filter((file) =>
			["image/jpeg", "image/png", "image/webp"].includes(file.type),
		);
		if (validFiles.length !== selectedFiles.length) {
			toast.error("Only JPEG, PNG, and WebP images are allowed");
		}
		setFiles((prev) =>
			[...prev, ...validFiles].slice(
				0,
				3 - (incident?.attachments?.length || 0),
			),
		);
	};

	if (loading) return <LoadingSkeleton count={3} height="h-48" />;
	if (!incident) return null;

	// --- PERMISSION LOGIC ---
	const isOwner = currentUserId === incident.reportedById;
	const canEdit =
		(incident.status === "OPEN" && (isAdmin || isOwner)) ||
		(incident.status === "IN_PROGRESS" && isAdmin);
	const canDelete =
		isAdmin &&
		(incident.status === "OPEN" || incident.status === "REJECTED");
	const canChangeStatus =
		incident.status !== "CLOSED" && incident.status !== "REJECTED";
	const canAssign =
		isAdmin &&
		(incident.status === "OPEN" || incident.status === "IN_PROGRESS");

	const canStartWork =
		incident.status === "OPEN" &&
		(isAdmin || (isTechnician && incident.assignedToId === currentUserId));

	const canMarkResolved =
		incident.status === "IN_PROGRESS" &&
		(isAdmin || (isTechnician && incident.assignedToId === currentUserId));

	const canClose = isAdmin && incident.status === "RESOLVED";
	const canReject = isAdmin && incident.status === "OPEN";

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<button
				onClick={() => navigate("/incidents")}
				className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
			>
				<ArrowLeftIcon className="h-4 w-4 mr-1" />
				Back to Incidents
			</button>

			{/* Header card */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
			>
				<div className="p-6 border-b border-gray-100">
					<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
						<div>
							<div className="flex items-center gap-2 flex-wrap mb-2">
								<span className="text-sm font-mono text-gray-400">
									#{incident.id}
								</span>
								<StatusBadge status={incident.status} />
								<PriorityBadge priority={incident.priority} />
							</div>
							<h1 className="text-2xl font-bold text-gray-900">
								{incident.title}
							</h1>
						</div>

						<div className="flex flex-wrap gap-2">
							{/* Edit button — admin or reporter */}
							{canEdit && !isEditing && (
								<button
									onClick={startEditing}
									className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
								>
									<PencilIcon className="h-4 w-4" />
									Edit
								</button>
							)}
							{/* Delete button — admin, OPEN or REJECTED only */}
							{canDelete && (
								<button
									onClick={() => setDeleteTicketConfirm(true)}
									className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-2"
								>
									<TrashIcon className="h-4 w-4" />
									Delete
								</button>
							)}
							{/* Assign button - ADMIN only */}
							{canAssign && (
								<div className="relative">
									<button
										onClick={() => setAssignDropdown(!assignDropdown)}
										className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
									>
										<WrenchIcon className="h-4 w-4" />
										{incident.assignedToName ? "Reassign" : "Assign"}
									</button>
									{assignDropdown && (
										<div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1 max-h-60 overflow-y-auto">
											{technicians.map((tech) => {
												const techId = tech.id;
												return (
													<button
														key={techId}
														onClick={() => handleAssign(techId)}
														className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex flex-col gap-0.5 ${incident.assignedToId === techId ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600" : "text-gray-700 border-l-2 border-transparent"}`}
													>
														<span className="font-medium capitalize text-gray-900">
															{tech.name}
														</span>
														<span className="text-xs text-gray-400">
															{tech.role}
														</span>
													</button>
												);
											})}
										</div>
									)}
								</div>
							)}

							{/* Status action buttons */}
							{canChangeStatus && (
								<div className="flex gap-2">
									{canStartWork && (
										<button
											onClick={() =>
												setStatusDialog({ isOpen: true, status: "IN_PROGRESS" })
											}
											className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
										>
											Start Work
										</button>
									)}
									{canMarkResolved && (
										<button
											onClick={() =>
												setStatusDialog({ isOpen: true, status: "RESOLVED" })
											}
											className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
										>
											Mark Resolved
										</button>
									)}
									{canClose && (
										<button
											onClick={() =>
												setStatusDialog({ isOpen: true, status: "CLOSED" })
											}
											className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
										>
											Close Ticket
										</button>
									)}
									{canReject && (
										<button
											onClick={() =>
												setStatusDialog({ isOpen: true, status: "REJECTED" })
											}
											className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
										>
											Reject
										</button>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Detail grid */}
				<div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						{isEditing ? (
							<div className="space-y-4">
								<div>
									<label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
										Title
									</label>
									<input
										type="text"
										value={editForm.title}
										onChange={(e) =>
											setEditForm((p) => ({ ...p, title: e.target.value }))
										}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
										Description
									</label>
									<textarea
										value={editForm.description}
										onChange={(e) =>
											setEditForm((p) => ({
												...p,
												description: e.target.value,
											}))
										}
										rows={4}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
										Location
									</label>
									<input
										type="text"
										value={editForm.location}
										onChange={(e) =>
											setEditForm((p) => ({ ...p, location: e.target.value }))
										}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
											Category
										</label>
										<select
											value={editForm.category}
											onChange={(e) =>
												setEditForm((p) => ({ ...p, category: e.target.value }))
											}
											className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
										<label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
											Priority
										</label>
										<select
											value={editForm.priority}
											onChange={(e) =>
												setEditForm((p) => ({ ...p, priority: e.target.value }))
											}
											className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
										>
											<option value="LOW">Low</option>
											<option value="MEDIUM">Medium</option>
											<option value="HIGH">High</option>
											<option value="CRITICAL">Critical</option>
										</select>
									</div>
								</div>
								<div>
									<label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
										Preferred Contact
									</label>
									<input
										type="text"
										value={editForm.preferredContact}
										onChange={(e) =>
											setEditForm((p) => ({
												...p,
												preferredContact: e.target.value,
											}))
										}
										className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										placeholder="Optional"
									/>
								</div>
								<div className="flex gap-3 pt-2">
									<button
										onClick={handleSaveEdit}
										disabled={savingEdit}
										className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
									>
										{savingEdit ? "Saving..." : "Save Changes"}
									</button>
									<button
										onClick={() => setIsEditing(false)}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
									>
										Cancel
									</button>
								</div>
							</div>
						) : (
							<div>
								<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
									Description
								</h3>
								<p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
									{incident.description}
								</p>
							</div>
						)}

						{/* Attachments */}
						<div>
							<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
								<ImageIcon className="h-4 w-4" />
								Attachments
							</h3>
							{incident.attachments?.length > 0 ? (
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									{incident.attachments.map((att) => (
										<SecureAttachment
											key={att.id}
											incidentId={incident.id}
											attachment={att}
										/>
									))}
								</div>
							) : (
								<div className="text-sm text-gray-400 italic">
									No attachments
								</div>
							)}

							{/* Upload more - ONLY visible to the reporter (isOwner) */}
							{isOwner &&
								(incident.attachments?.length || 0) + files.length < 3 && (
									<div className="mt-3">
										<label className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
											<UploadIcon className="h-4 w-4" />
											Add Image
											<input
												type="file"
												className="sr-only"
												accept="image/jpeg,image/png,image/webp"
												onChange={handleFileChange}
											/>
										</label>
									</div>
								)}

							{isOwner && files.length > 0 && (
								<div className="mt-3 grid grid-cols-3 gap-3">
									{files.map((file, index) => (
										<div
											key={index}
											className="relative group rounded-lg overflow-hidden border border-gray-200"
										>
											<img
												src={URL.createObjectURL(file)}
												alt={`Preview ${index}`}
												className="h-24 w-full object-cover"
											/>
											<button
												onClick={() =>
													setFiles((prev) => prev.filter((_, i) => i !== index))
												}
												className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<XIcon className="h-3 w-3" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Resolution / Rejection notes */}
						{incident.resolutionNotes && (
							<div className="bg-green-50 p-4 rounded-lg border border-green-200">
								<h3 className="text-sm font-semibold text-green-800 mb-1">
									Resolution Notes
								</h3>
								<p className="text-sm text-green-700">
									{incident.resolutionNotes}
								</p>
							</div>
						)}
						{incident.rejectionReason && (
							<div className="bg-red-50 p-4 rounded-lg border border-red-200">
								<h3 className="text-sm font-semibold text-red-800 mb-1">
									Rejection Reason
								</h3>
								<p className="text-sm text-red-700">
									{incident.rejectionReason}
								</p>
							</div>
						)}
					</div>

					{/* Sidebar details */}
					<div className="space-y-5">
						<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
							Details
						</h3>
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
								<div>
									<p className="text-xs text-gray-400">Location</p>
									<p className="text-sm font-medium text-gray-900">
										{incident.location}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<TagIcon className="h-4 w-4 text-gray-400 mt-0.5" />
								<div>
									<p className="text-xs text-gray-400">Category</p>
									<p className="text-sm font-medium text-gray-900">
										{incident.category}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<ClockIcon className="h-4 w-4 text-gray-400 mt-0.5" />
								<div>
									<p className="text-xs text-gray-400">Reported</p>
									<p className="text-sm font-medium text-gray-900">
										{new Date(incident.createdAt).toLocaleString()}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<UserIcon className="h-4 w-4 text-gray-400 mt-0.5" />
								<div>
									<p className="text-xs text-gray-400">Reported By</p>
									<p className="text-sm font-medium text-gray-900">
										{incident.reportedByName || incident.reporterName}
									</p>
								</div>
							</div>
							{incident.preferredContact && (
								<div className="flex items-start gap-3">
									<PhoneIcon className="h-4 w-4 text-gray-400 mt-0.5" />
									<div>
										<p className="text-xs text-gray-400">Contact</p>
										<p className="text-sm font-medium text-gray-900">
											{incident.preferredContact}
										</p>
									</div>
								</div>
							)}
							<div className="pt-3 border-t border-gray-100 flex items-start gap-3">
								<WrenchIcon className="h-4 w-4 text-gray-400 mt-0.5" />
								<div>
									<p className="text-xs text-gray-400">Assigned To</p>
									<p className="text-sm font-medium text-gray-900">
										{incident.assignedToName || (
											<span className="text-gray-400 italic">Unassigned</span>
										)}
									</p>
								</div>
							</div>
						</div>

						{incident.minutesElapsed !== undefined && (
							<SlaTimer ticket={incident} />
						)}
					</div>
				</div>
			</motion.div>

			{/* Comments section */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
			>
				<div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
					<MessageSquareIcon className="h-5 w-5 text-gray-400" />
					<h2 className="text-lg font-semibold text-gray-900">
						Comments ({incident.comments?.length || 0})
					</h2>
				</div>

				<div className="p-6 space-y-6">
					{!incident.comments || incident.comments.length === 0 ? (
						<p className="text-center text-sm text-gray-400 py-6">
							No comments yet. Be the first to comment.
						</p>
					) : (
						<div className="space-y-5">
							{incident.comments.map((comment) => {
								const isCommentAuthor = currentUserId === comment.authorId;
								const canDeleteComment = isCommentAuthor || isAdmin;

								return (
									<div key={comment.id} className="flex gap-3">
										<div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
											<span className="text-blue-700 font-semibold text-sm">
												{comment.authorName.charAt(0).toUpperCase()}
											</span>
										</div>
										<div className="flex-1">
											{editingComment === comment.id ? (
												<div className="space-y-2">
													<textarea
														value={editCommentText}
														onChange={(e) => setEditCommentText(e.target.value)}
														className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														rows="3"
													/>
													<div className="flex gap-2">
														<button
															onClick={() => handleEditComment(comment.id)}
															className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
														>
															Save
														</button>
														<button
															onClick={() => {
																setEditingComment(null);
																setEditCommentText("");
															}}
															className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
														>
															Cancel
														</button>
													</div>
												</div>
											) : (
												<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
													<div className="flex justify-between items-start mb-1">
														<span className="text-sm font-semibold text-gray-900">
															{comment.authorName}
														</span>
														<span className="text-xs text-gray-400">
															{new Date(comment.createdAt).toLocaleString()}
														</span>
													</div>
													<p className="text-sm text-gray-700 whitespace-pre-wrap">
														{comment.content}
													</p>
												</div>
											)}

											{editingComment !== comment.id &&
												(isCommentAuthor || canDeleteComment) && (
													<div className="mt-1 flex justify-end gap-3">
														{isCommentAuthor && (
															<button
																onClick={() => {
																	setEditingComment(comment.id);
																	setEditCommentText(comment.content);
																}}
																className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
															>
																<PencilIcon className="h-3 w-3" /> Edit
															</button>
														)}
														{canDeleteComment && (
															<button
																onClick={() =>
																	setDeleteConfirm({
																		isOpen: true,
																		commentId: comment.id,
																	})
																}
																className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
															>
																<TrashIcon className="h-3 w-3" /> Delete
															</button>
														)}
													</div>
												)}
										</div>
									</div>
								);
							})}
						</div>
					)}

					{/* Add comment form */}
					<form
						onSubmit={handleAddComment}
						className="mt-6 flex gap-3 pt-5 border-t border-gray-100"
					>
						<div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
							<span className="text-white font-semibold text-sm">
								{user?.fullName?.charAt(0).toUpperCase() || "?"}
							</span>
						</div>
						<div className="flex-1">
							<textarea
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								placeholder="Add a comment..."
								className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50"
								rows="3"
							/>
							<div className="mt-2 flex justify-end">
								<button
									type="submit"
									disabled={!commentText.trim() || submittingComment}
									className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
								>
									{submittingComment ? "Posting..." : "Post Comment"}
								</button>
							</div>
						</div>
					</form>
				</div>
			</motion.div>

			{/* Status update dialog */}
			{statusDialog.isOpen && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div className="flex min-h-screen items-center justify-center p-4">
						<div
							className="fixed inset-0 bg-black/40"
							onClick={() =>
								setStatusDialog({
									isOpen: false,
									status: "",
								})
							}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6"
						>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Update Status to {statusDialog.status.replace(/_/g, " ")}
							</h3>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{statusDialog.status === "REJECTED"
										? "Reason for rejection *"
										: statusDialog.status === "RESOLVED"
											? "Resolution notes"
											: "Notes (optional)"}
								</label>
								<textarea
									value={statusNotes}
									onChange={(e) => setStatusNotes(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									rows="3"
									placeholder={
										statusDialog.status === "REJECTED"
											? "Explain why this ticket is being rejected..."
											: "Add any relevant notes..."
									}
									required={statusDialog.status === "REJECTED"}
								/>
							</div>
							<div className="flex gap-3 justify-end">
								<button
									onClick={() => {
										setStatusDialog({
											isOpen: false,
											status: "",
										});
										setStatusNotes("");
									}}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									onClick={handleStatusUpdate}
									disabled={
										statusDialog.status === "REJECTED" && !statusNotes.trim()
									}
									className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${statusDialog.status === "REJECTED" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
								>
									Confirm
								</button>
							</div>
						</motion.div>
					</div>
				</div>
			)}

			{/* Delete comment confirm */}
			<ConfirmDialog
				isOpen={deleteConfirm.isOpen}
				title="Delete Comment"
				message="Are you sure you want to delete this comment? This action cannot be undone."
				confirmLabel="Delete"
				destructive
				onConfirm={() => handleDeleteComment(deleteConfirm.commentId)}
				onCancel={() =>
					setDeleteConfirm({
						isOpen: false,
						commentId: null,
					})
				}
			/>

			<ConfirmDialog
				isOpen={deleteTicketConfirm}
				title="Delete Ticket"
				message={`Are you sure you want to permanently delete ticket #${incident?.id}? This will remove all comments and attachments. This action cannot be undone.`}
				confirmLabel={deletingTicket ? "Deleting..." : "Delete"}
				destructive
				onConfirm={handleDeleteTicket}
				onCancel={() => setDeleteTicketConfirm(false)}
			/>
		</div>
	);
}
