import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, AlertTriangleIcon } from "lucide-react";
export function ConfirmDialog({
	isOpen,
	onClose,
	onCancel,
	onConfirm,
	title,
	message,
	confirmText,
	confirmLabel,
	cancelText = "Cancel",
	danger = false,
	destructive = false,
}) {
	if (!isOpen) return null;
	const isDanger = danger || destructive;
	const confirmButtonText = confirmLabel || confirmText || "Confirm";
	const handleClose = onCancel || onClose || (() => {});
	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 overflow-y-auto">
				<div className="flex min-h-screen items-center justify-center p-4">
					<motion.div
						initial={{
							opacity: 0,
						}}
						animate={{
							opacity: 1,
						}}
						exit={{
							opacity: 0,
						}}
						className="fixed inset-0 bg-black/40"
						onClick={handleClose}
					/>
					<motion.div
						initial={{
							opacity: 0,
							scale: 0.95,
						}}
						animate={{
							opacity: 1,
							scale: 1,
						}}
						exit={{
							opacity: 0,
							scale: 0.95,
						}}
						className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6"
					>
						<button
							onClick={handleClose}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
						>
							<XIcon className="h-5 w-5" />
						</button>

						<div className="flex items-start gap-4">
							{isDanger && (
								<div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
									<AlertTriangleIcon className="h-5 w-5 text-red-600" />
								</div>
							)}
							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									{title}
								</h3>
								<p className="text-sm text-gray-600">{message}</p>
							</div>
						</div>

						<div className="flex gap-3 justify-end mt-6">
							<button
								onClick={handleClose}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								{cancelText}
							</button>
							<button
								onClick={() => {
									onConfirm();
									if (onClose) onClose();
								}}
								className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDanger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"}`}
							>
								{confirmButtonText}
							</button>
						</div>
					</motion.div>
				</div>
			</div>
		</AnimatePresence>
	);
}
