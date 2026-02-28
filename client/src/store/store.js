import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import analysisReducer from "./analysisSlice";
import applicationReducer from "./applicationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analysis: analysisReducer,
    application: applicationReducer,
  },
});

export default store;
