import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  result: null,
  history: [],
  loading: false,
  error: null,
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    setAnalysisLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setAnalysisResult: (state, action) => {
      state.result = action.payload;
      state.loading = false;
      state.error = null;
    },
    setAnalysisError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    clearResult: (state) => {
      state.result = null;
      state.error = null;
    },
  },
});

export const {
  setAnalysisLoading,
  setAnalysisResult,
  setAnalysisError,
  setHistory,
  clearResult,
} = analysisSlice.actions;
export default analysisSlice.reducer;
