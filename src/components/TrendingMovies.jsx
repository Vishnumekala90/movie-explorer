import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MovieGrid from './MovieGrid';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import { useMovies } from '../context/MovieContext';

/** "Trending this week" section, fed by TMDb's trending endpoint. */
export default function TrendingMovies() {
  const { trending, loadTrending } = useMovies();

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  return (
    <Box component="section" aria-labelledby="trending-heading">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalFireDepartmentIcon color="primary" />
        <Typography id="trending-heading" variant="h5" component="h2">
          Trending this week
        </Typography>
      </Box>

      {trending.loading && <Loading label="Loading trending movies..." />}
      {trending.error && (
        <ErrorMessage message={trending.error} onRetry={() => loadTrending(true)} />
      )}
      {!trending.loading && !trending.error && trending.movies.length === 0 && (
        <ErrorMessage severity="info" message="No trending movies to show right now." />
      )}
      {trending.movies.length > 0 && <MovieGrid movies={trending.movies} />}
    </Box>
  );
}
