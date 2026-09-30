// Bonus feature: filter the loaded search results by genre, year and minimum rating.
import { useEffect, useState } from 'react';
import { Box, Button, MenuItem, TextField } from '@mui/material';
import { getGenres } from '../services/tmdbApi';

export const EMPTY_FILTERS = { genre: '', year: '', rating: '' };

const RATING_OPTIONS = [5, 6, 7, 8];

export default function MovieFilters({ filters, onChange }) {
  const [genres, setGenres] = useState([]);

  // The genre list is a nice-to-have: if it fails to load, the other filters still work.
  useEffect(() => {
    let cancelled = false;
    getGenres()
      .then((list) => {
        if (!cancelled) setGenres(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (field) => (event) =>
    onChange({ ...filters, [field]: event.target.value });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr) auto' },
        alignItems: 'center',
        my: 2,
      }}
    >
      <TextField
        select
        size="small"
        label="Genre"
        value={filters.genre}
        onChange={update('genre')}
        disabled={genres.length === 0}
        sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
      >
        <MenuItem value="">Any genre</MenuItem>
        {genres.map((genre) => (
          <MenuItem key={genre.id} value={String(genre.id)}>
            {genre.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        label="Year"
        type="number"
        value={filters.year}
        onChange={update('year')}
        slotProps={{ htmlInput: { min: 1888, max: new Date().getFullYear() + 5 } }}
      />

      <TextField
        select
        size="small"
        label="Min rating"
        value={filters.rating}
        onChange={update('rating')}
      >
        <MenuItem value="">Any rating</MenuItem>
        {RATING_OPTIONS.map((rating) => (
          <MenuItem key={rating} value={String(rating)}>
            {rating}+ stars
          </MenuItem>
        ))}
      </TextField>

      <Button
        onClick={() => onChange(EMPTY_FILTERS)}
        disabled={!hasActiveFilters}
        sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
      >
        Reset filters
      </Button>
    </Box>
  );
}
