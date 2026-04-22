import { api } from "./api";

export const createIncident = async (data) => {
	const response = await api.post("/incidents", data);
	return response.data;
};

export const getIncidents = async (filters = {}) => {
	const params = new URLSearchParams(filters).toString();
	const response = await api.get(`/incidents${params ? `?${params}` : ""}`);
	return response.data;
};

export const getIncidentById = async (id) => {
	const response = await api.get(`/incidents/${id}`);
	return response.data;
};

export const updateIncident = async (id, data) => {
	const response = await api.put(`/incidents/${id}`, data);
	return response.data;
};

export const deleteIncident = async (id) => {
	const response = await api.delete(`/incidents/${id}`);
	return response.data;
};

export const updateIncidentStatus = async (id, status, resolutionNotes, rejectionReason) => {
	const response = await api.patch(`/incidents/${id}/status`, {
		status,
		resolutionNotes,
		rejectionReason,
	});
	return response.data;
};

export const assignIncident = async (id, technicianId) => {
	const response = await api.patch(`/incidents/${id}/assign`, {
		technicianId,
	});
	return response.data;
};

export const uploadAttachments = async (id, files) => {
	const uploadPromises = Array.from(files).map((file) => {
		const formData = new FormData();

		formData.append("file", file);

		return api.post(`/incidents/${id}/attachments`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	});

	const responses = await Promise.all(uploadPromises);

	return responses.map((res) => res.data);
};

export const deleteAttachment = async (id, attachmentId) => {
	const response = await api.delete(
		`/incidents/${id}/attachments/${attachmentId}`,
	);
	return response.data;
};

export const getSlaSummary = async () => {
	const response = await api.get("/incidents/sla-summary");
	return response.data;
};

export const getAttachmentBlob = async (incidentId, attachmentId) => {
	const response = await api.get(
		`/incidents/${incidentId}/attachments/${attachmentId}`,
		{
			responseType: "blob",
		},
	);
	return response.data;
};
