import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MovieGrid from '../components/MovieGrid';
import { useMovies } from '../context/MovieContext';

/** Route: /favorites. Shows movies saved in localStorage. */
export default function Favorites() {
  const { favorites } = useMovies();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Your favorites
      </Typography>

      {favorites.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FavoriteBorderIcon fontSize="large" color="disabled" />
          <Typography variant="h6" sx={{ mt: 1 }}>
            No favorites yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Tap the heart on any movie to save it here.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Discover movies
          </Button>
        </Paper>
      ) : (
        <MovieGrid movies={favorites} />
      )}
    </Box>
  );
}
