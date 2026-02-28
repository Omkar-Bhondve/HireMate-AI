import api from "./api";

export const createApplication = (data) => api.post("/applications", data);
export const getApplications = () => api.get("/applications");
export const getAnalytics = () => api.get("/applications/analytics");
export const updateApplication = (id, data) =>
  api.put(`/applications/${id}`, data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);
export const generateFollowUpEmail = (id) =>
  api.post(`/applications/${id}/generate-follow-up`);
