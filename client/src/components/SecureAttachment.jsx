import { useEffect, useState } from "react";
import { getAttachmentBlob } from "../services/incidents";

function SecureAttachment({ incidentId, attachment }) {
	const [imgUrl, setImgUrl] = useState(null);

	useEffect(() => {
		const fetchImage = async () => {
			try {
				const blob = await getAttachmentBlob(incidentId, attachment.id);
				const objectUrl = URL.createObjectURL(blob);
				setImgUrl(objectUrl);
			} catch (error) {
				console.error("Failed to load attachment image:", error);
			}
		};
		fetchImage();

		// Cleanup memory when component unmounts
		return () => {
			if (imgUrl) URL.revokeObjectURL(imgUrl);
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
		<a
			href={imgUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="block relative group rounded-lg overflow-hidden border border-gray-200"
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
	);
}

export default SecureAttachment;
