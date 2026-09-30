import { useEffect, useState } from 'react';
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * Search input + button. `initialValue` mirrors the last submitted query so the
 * persisted "last search" shows up in the box after a refresh.
 */
export default function SearchBar({ initialValue = '', loading = false, onSearch, onClear }) {
  const [value, setValue] = useState(initialValue);
  const [validationError, setValidationError] = useState('');

  // Keep the input in sync when the query changes from outside (restore / clear).
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim()) {
      setValidationError('Please enter a movie name to search.'); // empty search handling
      return;
    }
    setValidationError('');
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
    setValidationError('');
    onClear();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      role="search"
      noValidate
      sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}
    >
      <TextField
        fullWidth
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (validationError) setValidationError('');
        }}
        placeholder="Search for a movie, e.g. Batman"
        label="Search movies"
        error={Boolean(validationError)}
        helperText={validationError}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: value ? (
              <InputAdornment position="end">
                <IconButton aria-label="Clear search" onClick={handleClear} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ height: 56, px: { xs: 2, sm: 4 }, flexShrink: 0 }}
      >
        Search
      </Button>
    </Box>
  );
}
