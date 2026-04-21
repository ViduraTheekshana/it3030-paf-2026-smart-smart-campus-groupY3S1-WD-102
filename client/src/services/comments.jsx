import { api } from "./api";
export const addComment = async (incidentId, content) => {
	const response = await api.post(`/incidents/${incidentId}/comments`, {
		content,
	});
	return response.data;
};

export const editComment = async (incidentId, commentId, content) => {
	const response = await api.patch(
		`/incidents/${incidentId}/comments/${commentId}`,
		{
			content,
		},
	);
	return response.data;
};

export const deleteComment = async (incidentId, commentId) => {
	const response = await api.delete(
		`/incidents/${incidentId}/comments/${commentId}`,
	);
	return response.data;
};
