import { configureStore } from '@reduxjs/toolkit';
import modalsSlice from './modals-slice';
import appSlice from './app-slice';
import consoleSlice from './console-slice';
import serverSlice from './server-slice';

export const store = configureStore({
  reducer: {
    app: appSlice,
    consoles: consoleSlice,
    modals: modalsSlice,
    server: serverSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type IRootState = ReturnType<typeof store.getState>;
