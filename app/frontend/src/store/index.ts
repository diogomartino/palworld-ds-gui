import { configureStore } from '@reduxjs/toolkit';
import modalsSlice from './modals-slice';
import appSlice from './app-slice';
import consoleSlice from './console-slice';
import serverSlice from './server-slice';
import socketSlice from './socket-slice';

// Logger middleware (only in development)
const loggerMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);
  const nextState = store.getState();

  console.debug('[STORE DEBUG]', action.type, {
    action,
    prevState,
    nextState
  });

  return result;
};

export const store = configureStore({
  reducer: {
    app: appSlice,
    consoles: consoleSlice,
    modals: modalsSlice,
    server: serverSlice,
    socket: socketSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(process.env.NODE_ENV !== 'production' ? [loggerMiddleware] : [])
});

export type IRootState = ReturnType<typeof store.getState>;
