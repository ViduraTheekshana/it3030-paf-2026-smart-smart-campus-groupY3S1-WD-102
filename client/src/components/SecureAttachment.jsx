import { useEffect, useState } from "react";
import { TrashIcon } from "lucide-react";
import { getAttachmentBlob } from "../services/incidents";

function SecureAttachment({ incidentId, attachment, onDelete }) {
	const [imgUrl, setImgUrl] = useState(null);

	useEffect(() => {
		let objectUrl;
		const fetchImage = async () => {
			try {
				const blob = await getAttachmentBlob(incidentId, attachment.id);
				objectUrl = URL.createObjectURL(blob);
				setImgUrl(objectUrl);
			} catch (error) {
				console.error("Failed to load attachment image:", error);
			}
		};
		fetchImage();

		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [incidentId, attachment.id]);

	if (!imgUrl) {
		return (
			<div className="h-32 w-full bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400 border border-gray-200 rounded-lg">
				Loading...
			</div>
		);
	}

	return (
		<div className="relative group rounded-lg overflow-hidden border border-gray-200">
			<a
				href={imgUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="block"
			>
				<img
					src={imgUrl}
					alt={attachment.fileName || "Attachment"}
					className="h-32 w-full object-cover group-hover:opacity-75 transition-opacity"
				/>
				<div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<p className="text-[10px] text-white truncate">{attachment.fileName}</p>
				</div>
			</a>

			{onDelete && (
				<button
					onClick={(e) => {
						e.preventDefault();
						onDelete(attachment.id);
					}}
					className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
					title="Delete attachment"
				>
					<TrashIcon className="h-3 w-3" />
				</button>
			)}
		</div>
	);
}

export default SecureAttachment;
