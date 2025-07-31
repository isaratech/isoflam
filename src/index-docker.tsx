// This is an entry point for the Docker image build.
import React from 'react';
import ReactDOM from 'react-dom/client';
import {Box} from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';
import Isoflam from 'src/Isoflam';
import {colors, icons, initialData} from './utils/initialData';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GlobalStyles
      styles={{
        body: {
          margin: 0
        }
      }}
    />
    <Box sx={{ width: '100vw', height: '100vh' }}>
      <Isoflam initialData={{ ...initialData, icons, colors }} />
    </Box>
  </React.StrictMode>
);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
