import { Alert, Button } from '@mui/material';

/** User-friendly error banner with an optional retry button. */
export default function ErrorMessage({ message, onRetry, severity = 'error' }) {
  return (
    <Alert
      severity={severity}
      sx={{ my: 2 }}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      }
    >
      {message}
    </Alert>
  );
}
