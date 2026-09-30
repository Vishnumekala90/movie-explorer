import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import SearchBar from '../components/SearchBar';
import MovieFilters, { EMPTY_FILTERS } from '../components/MovieFilters';
import MovieGrid from '../components/MovieGrid';
import TrendingMovies from '../components/TrendingMovies';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { useMovies } from '../context/MovieContext';
import { getReleaseYear } from '../utils/movieHelpers';

// Applies the bonus filters to the results loaded so far.
function applyFilters(movies, { genre, year, rating }) {
  return movies.filter((movie) => {
    if (genre && !(movie.genre_ids ?? []).includes(Number(genre))) return false;
    if (year && getReleaseYear(movie.release_date) !== String(year)) return false;
    if (rating && (movie.vote_average ?? 0) < Number(rating)) return false;
    return true;
  });
}

export default function Home() {
  const { searchQuery, search, hasMore, runSearch, loadMore, restoreLastSearch, clearSearch } =
    useMovies();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Bring back the persisted last search after a refresh / reopen.
  useEffect(() => {
    restoreLastSearch();
  }, [restoreLastSearch]);

  const handleSearch = (query) => {
    setFilters(EMPTY_FILTERS); // filters belong to one result set
    runSearch(query);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    clearSearch();
  };

  const { results, loading, loadingMore, error, loadMoreError, hasSearched, totalResults } = search;
  const filteredResults = useMemo(() => applyFilters(results, filters), [results, filters]);
  const filtersActive = Object.values(filters).some(Boolean);

  // Automatically load the next page when the sentinel below the grid becomes visible.
  const sentinelRef = useInfiniteScroll({
    onIntersect: loadMore,
    enabled: hasMore && !loading && !loadingMore && !loadMoreError,
    trigger: search.page,
  });

  const showResults = hasSearched && !loading && !error;

  return (
    <Box>
      <SearchBar
        initialValue={searchQuery}
        loading={loading}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {!hasSearched && (
        <Box sx={{ mt: 4 }}>
          <TrendingMovies />
        </Box>
      )}

      {hasSearched && (
        <Box component="section" aria-live="polite" sx={{ mt: 3 }}>
          {loading && <Loading label={`Searching for "${searchQuery}"...`} />}
          {error && <ErrorMessage message={error} onRetry={() => runSearch(searchQuery)} />}

          {showResults && results.length === 0 && (
            <ErrorMessage
              severity="info"
              message={`No movies found for "${searchQuery}". Try a different title.`}
            />
          )}

          {showResults && results.length > 0 && (
            <>
              <Typography variant="h5" component="h2">
                Results for "{searchQuery}"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalResults.toLocaleString()} {totalResults === 1 ? 'movie' : 'movies'} found
                {filtersActive && ` · ${filteredResults.length} match your filters so far`}
              </Typography>

              <MovieFilters filters={filters} onChange={setFilters} />

              {filteredResults.length > 0 ? (
                <MovieGrid movies={filteredResults} />
              ) : (
                <ErrorMessage
                  severity="info"
                  message={
                    hasMore
                      ? 'No loaded movies match these filters yet. Keep scrolling to load more.'
                      : 'No movies match these filters.'
                  }
                />
              )}

              {/* Invisible marker watched by the IntersectionObserver */}
              <Box ref={sentinelRef} sx={{ height: 1 }} aria-hidden="true" />

              {loadingMore && <Loading compact label="Loading more movies..." />}
              {loadMoreError && <ErrorMessage message={loadMoreError} onRetry={loadMore} />}
              {!hasMore && !loadingMore && !loadMoreError && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                  You've reached the end of the results.
                </Typography>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
