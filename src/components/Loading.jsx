import { Box, CircularProgress, Typography } from '@mui/material';

/** Centered spinner with an optional label. Use `compact` for inline "loading more". */
export default function Loading({ label = 'Loading...', compact = false }) {
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        py: compact ? 3 : 8,
      }}
    >
      <CircularProgress size={compact ? 28 : 44} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
