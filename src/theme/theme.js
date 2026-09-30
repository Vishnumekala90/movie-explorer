import { createTheme } from '@mui/material/styles';

/** Builds the MUI theme for the given mode ("light" | "dark"). */
export function buildTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#ff6b6b' : '#d32f2f' },
      background:
        mode === 'dark'
          ? { default: '#121212', paper: '#1e1e1e' }
          : { default: '#f5f5f7', paper: '#ffffff' },
    },
    shape: { borderRadius: 12 },
    components: {
      // Red bar in light mode, neutral dark surface in dark mode; white text on both
      // keeps the navigation readable in either theme.
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#d32f2f',
            backgroundImage: 'none',
            color: '#ffffff',
          },
        },
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
    },
  });
}
