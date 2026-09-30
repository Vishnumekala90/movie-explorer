import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import ThemeToggle from './ThemeToggle';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';

// On phones the nav shows icons only; from the "sm" breakpoint up it shows labels too.
function NavItem({ to, label, icon, active }) {
  return (
    <>
      <Tooltip title={label}>
        <IconButton
          component={RouterLink}
          to={to}
          color="inherit"
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          sx={{ display: { xs: 'inline-flex', sm: 'none' }, opacity: active ? 1 : 0.75 }}
        >
          {icon}
        </IconButton>
      </Tooltip>
      <Button
        component={RouterLink}
        to={to}
        color="inherit"
        startIcon={icon}
        aria-current={active ? 'page' : undefined}
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          opacity: active ? 1 : 0.75,
          fontWeight: active ? 700 : 400,
        }}
      >
        {label}
      </Button>
    </>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { favorites } = useMovies();
  const { logout } = useAuth();

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 0.5 }}>
        <MovieIcon sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 700,
            flexGrow: 1,
            fontSize: { xs: '1.05rem', sm: '1.25rem' },
          }}
          noWrap
        >
          Movie Explorer
        </Typography>

        <NavItem to="/" label="Home" icon={<HomeIcon />} active={pathname === '/'} />
        <NavItem
          to="/favorites"
          label="Favorites"
          active={pathname === '/favorites'}
          icon={
            <Badge badgeContent={favorites.length} color="warning" max={99}>
              <FavoriteIcon />
            </Badge>
          }
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ThemeToggle />
          <Tooltip title="Log out">
            <IconButton color="inherit" onClick={logout} aria-label="Log out">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
