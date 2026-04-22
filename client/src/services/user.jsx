import { api } from "./api";

export const getAllUsers = async () => {
	const response = await api.get("/admin/users");
	return response.data;
};

export const getUsersByRole = async (roleName) => {
	const allUsers = await getAllUsers();
	return allUsers.filter((user) => user.role === roleName);
};

export const getTechnicians = async () => {
	return await getUsersByRole("ROLE_TECHNICIAN");
};

export const getAdmins = async () => {
	return await getUsersByRole("ROLE_ADMIN");
};

export const getManagers = async () => {
	return await getUsersByRole("ROLE_MANAGER");
};

export const getRegularUsers = async () => {
	return await getUsersByRole("ROLE_USER");
};

