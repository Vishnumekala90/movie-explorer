import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useMovies } from '../context/MovieContext';

/** Icon button that switches between light and dark mode. */
export default function ThemeToggle() {
  const { themeMode, toggleTheme } = useMovies();
  const label = themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleTheme} aria-label={label}>
        {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
