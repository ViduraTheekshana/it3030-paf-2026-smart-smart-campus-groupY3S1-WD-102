import api from "./api";

export const getNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`);
  return response.data;
};

export const getUnreadCount = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}/unread-count`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async (userId) => {
  const response = await api.put(`/notifications/user/${userId}/read-all`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
