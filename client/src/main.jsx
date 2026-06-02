import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { startKeepAwake } from './utils/keepAwake';

// Start keep-awake service to prevent backend from sleeping
startKeepAwake();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(8, 12, 28, 0.97)',
            color: '#e2e8f0',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '0.8rem',
            borderRadius: '0.75rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

