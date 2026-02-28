import API from "./api";

export const analyzeResume = async (formData) => {
  const response = await API.post("/analysis/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await API.get("/analysis/history");
  return response.data;
};

export const getAnalysisById = async (id) => {
  const response = await API.get(`/analysis/${id}`);
  return response.data;
};
