import { Box } from '@mui/material';
import MovieCard from './MovieCard';

/**
 * Responsive grid (mobile-first): 2 columns on phones, 3 on tablets,
 * 4 on small desktops and 5 on large screens.
 */
export default function MovieGrid({ movies }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 1.5, sm: 2.5 },
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
      }}
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </Box>
  );
}
