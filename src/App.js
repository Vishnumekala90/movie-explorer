import { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import MovieDetailsPage from './pages/MovieDetails';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
import { useMovies } from './context/MovieContext';
import { buildTheme } from './theme/theme';

export default function App() {
  const { themeMode } = useMovies();
  // Rebuild the MUI theme only when the mode changes.
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Everything below requires the demo login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
            <Route path="/favorites" element={<Favorites />} />
          </Route>
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
