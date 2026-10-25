import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#161a23', color: '#f4efe6', border: '1px solid rgba(201,169,110,.35)' },
            iconTheme: { primary: '#c9a96e', secondary: '#0b0d12' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
