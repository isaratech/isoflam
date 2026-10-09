// This is an entry point for running the app in dev mode.
import React from 'react';
import ReactDOM from 'react-dom/client';
import GlobalStyles from '@mui/material/GlobalStyles';
import {Box} from '@mui/material';
import Isoflam from 'src/Isoflam';
import {colors, icons, initialData} from 'src/utils/initialData';

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

// Register service worker for PWA functionality (disabled on localhost)
if ('serviceWorker' in navigator && !isLocalhost()) {
    window.addEventListener('load', () => {
        // Relative path so the app also works when served from a sub-path (e.g. GitHub Pages)
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} else if (isLocalhost()) {
    console.log('PWA service worker disabled on localhost for development');
}

function isLocalhost(): boolean {
    return Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.0/8 are considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );
}
