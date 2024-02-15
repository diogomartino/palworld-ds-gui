import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/app';
import { store } from './store';
import { Provider } from 'react-redux';
import { NextUIProvider } from '@nextui-org/react';
import './main.css';
import 'react-toastify/dist/ReactToastify.css';
import ModalsProvider from './components/modals';
import { BrowserRouter } from 'react-router-dom';
import SocketProvider from './components/socket-provider';
import CustomErrorBoundary from './components/custom-error-boundary';
import CustomToastContainer from './components/custom-toast-container';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomErrorBoundary>
      <NextUIProvider>
        <BrowserRouter>
          <Provider store={store}>
            <SocketProvider>
              <CustomToastContainer />
              <ModalsProvider />
              <App />
            </SocketProvider>
          </Provider>
        </BrowserRouter>
      </NextUIProvider>
    </CustomErrorBoundary>
  </React.StrictMode>
);
