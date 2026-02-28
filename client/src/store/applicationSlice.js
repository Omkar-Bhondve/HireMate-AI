import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
  name: "application",
  initialState: {
    applications: [],
    analytics: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setApplications: (state, action) => {
      state.applications = action.payload;
      state.loading = false;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    addApplication: (state, action) => {
      state.applications.unshift(action.payload);
    },
    updateApplication: (state, action) => {
      const index = state.applications.findIndex(
        (app) => app.id === action.payload.id,
      );
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
    removeApplication: (state, action) => {
      state.applications = state.applications.filter(
        (app) => app.id !== action.payload,
      );
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setApplications,
  setAnalytics,
  addApplication,
  updateApplication,
  removeApplication,
  setError,
} = applicationSlice.actions;

export default applicationSlice.reducer;
