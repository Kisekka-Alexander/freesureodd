import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

// Import your slice reducers here
import authSlice from "./slices/authSlice";

// Create a noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_: string, value: unknown) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

// Use conditional storage based on environment
const persistStorage = typeof window !== "undefined" ? storage : createNoopStorage();
// import userSlice from './slices/userSlice'

const rootReducer = combineReducers({
  // Add your reducers here
  auth: authSlice,
  // user: userSlice,
});

const persistConfig = {
  key: "root",
  storage: persistStorage,
  whitelist: ["auth"], // Add reducers you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
