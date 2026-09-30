import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

/** Demo login screen: username + password + Login button, then on to the app. */
export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Already signed in (e.g. opened /login manually): go straight to the app.
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(location.state?.from ?? '/', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: 4,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <ThemeToggle />
      </Box>
      <Container maxWidth="xs">
        <Paper
          elevation={4}
          sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', mb: 1, width: 48, height: 48 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5" component="h1">
            Movie Explorer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to discover your favorite films
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((shown) => !shown)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }}>
              Login
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Demo login: enter any username and password.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
