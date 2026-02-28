import { createSlice } from "@reduxjs/toolkit";

// Load persisted state
const token = localStorage.getItem("hiremate_token");
const user = localStorage.getItem("hiremate_user");

const initialState = {
  user: user ? JSON.parse(user) : null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem("hiremate_token", token);
      localStorage.setItem("hiremate_user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem("hiremate_token");
      localStorage.removeItem("hiremate_user");
    },
  },
});

export const { setLoading, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
