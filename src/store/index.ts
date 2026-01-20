import { configureStore } from "@reduxjs/toolkit";
import sheetReducer from "./sheetSlice";

export const store = configureStore({
  reducer: {
    sheet: sheetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
