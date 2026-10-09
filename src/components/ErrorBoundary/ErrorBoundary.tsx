import React from 'react';
import {Alert, Box, Button, Stack, Typography} from '@mui/material';

interface Props {
  children: React.ReactNode;
  onDownload: () => void;
  labels: {
    title: string;
    message: string;
    download: string;
    reload: string;
  };
}

interface State {
  error: Error | null;
}

// Last-resort screen when rendering fails: without it the whole app unmounts to a blank
// page and the drawing in progress is lost. Lets the user save the drawing before reloading.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Isoflam crashed:', error, errorInfo.componentStack);
  }

  render() {
    const { error } = this.state;
    const { children, onDownload, labels } = this.props;

    if (!error) return children;

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <Typography variant="h6">{labels.title}</Typography>
          <Typography variant="body2">{labels.message}</Typography>
          <Alert severity="error" sx={{ wordBreak: 'break-word' }}>
            {error.message}
          </Alert>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={onDownload}>
              {labels.download}
            </Button>
            <Button
              variant="text"
              onClick={() => {
                window.location.reload();
              }}
            >
              {labels.reload}
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }
}
