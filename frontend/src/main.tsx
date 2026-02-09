import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ConfigProvider, theme } from 'antd';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 12,
          fontFamily: 'Outfit, sans-serif',
        },
        components: {
          Layout: {
            headerBg: 'rgba(15, 23, 42, 0.8)',
            bodyBg: 'transparent',
          },
          Card: {
            colorBgContainer: 'rgba(30, 41, 59, 0.7)',
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
