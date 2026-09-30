import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

/** Shared shell (navbar + page container) for every signed-in page. */
export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container component="main" maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
