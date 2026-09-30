import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';

/** Shown for any URL that does not match a route. */
export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1.5,
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <MovieIcon color="primary" sx={{ fontSize: 64 }} />
      <Typography variant="h3" component="h1">
        404
      </Typography>
      <Typography variant="h6">This page could not be found.</Typography>
      <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 1 }}>
        Back to Home
      </Button>
    </Box>
  );
}
