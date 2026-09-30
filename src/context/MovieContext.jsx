// Shared movie/application state (React Context API):
//   - trending movies
//   - search query + paginated search results (drives infinite scrolling)
//   - favorites (persisted in localStorage)
//   - light/dark theme mode (persisted in localStorage)
// Small, purely local UI state (input text, filter values...) stays in components.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getTrendingMovies, searchMovies } from '../services/tmdbApi';
import {
  STORAGE_KEYS,
  getStoredValue,
  removeStoredValue,
  setStoredValue,
} from '../utils/localStorage';
import { toFavoriteSnapshot } from '../utils/movieHelpers';

const MovieContext = createContext(null);

const INITIAL_SEARCH_STATE = {
  results: [],
  page: 0, // last page that has been loaded
  totalPages: 0,
  totalResults: 0,
  loading: false, // first page of a new search
  loadingMore: false, // any following page
  error: null, // first page failed
  loadMoreError: null, // a following page failed
  hasSearched: false,
};

function getInitialTheme() {
  const saved = getStoredValue(STORAGE_KEYS.THEME);
  if (saved === 'light' || saved === 'dark') return saved;
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

// TMDb can return the same movie on two pages when its ranking shifts between
// requests, so merge by id to avoid duplicate cards and duplicate React keys.
function mergeUnique(existing, incoming) {
  const seen = new Set(existing.map((movie) => movie.id));
  return [...existing, ...incoming.filter((movie) => !seen.has(movie.id))];
}

export function MovieProvider({ children }) {
  // ---- Theme -------------------------------------------------------------
  const [themeMode, setThemeMode] = useState(getInitialTheme);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.THEME, themeMode);
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((mode) => (mode === 'light' ? 'dark' : 'light'));
  }, []);

  // ---- Favorites ---------------------------------------------------------
  const [favorites, setFavorites] = useState(() => {
    const saved = getStoredValue(STORAGE_KEYS.FAVORITES, []);
    return Array.isArray(saved) ? saved : [];
  });

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((movie) => movie.id)),
    [favorites]
  );

  const toggleFavorite = useCallback((movie) => {
    setFavorites((current) =>
      current.some((item) => item.id === movie.id)
        ? current.filter((item) => item.id !== movie.id) // remove
        : [...current, toFavoriteSnapshot(movie)] // add (never duplicates)
    );
  }, []);

  // ---- Trending ----------------------------------------------------------
  const [trending, setTrending] = useState({
    movies: [],
    loading: false,
    error: null,
  });
  const trendingLoadedRef = useRef(false);

  const loadTrending = useCallback(async (force = false) => {
    if (trendingLoadedRef.current && !force) return;
    trendingLoadedRef.current = true;
    setTrending((state) => ({ ...state, loading: true, error: null }));
    try {
      const movies = await getTrendingMovies();
      setTrending({ movies, loading: false, error: null });
    } catch (err) {
      trendingLoadedRef.current = false; // allow a retry
      setTrending((state) => ({ ...state, loading: false, error: err.message }));
    }
  }, []);

  // ---- Search + infinite scroll -----------------------------------------
  // `searchQuery` is the last submitted query. It is initialised from localStorage
  // so the last search survives a refresh.
  const [searchQuery, setSearchQuery] = useState(() =>
    getStoredValue(STORAGE_KEYS.LAST_SEARCH, '')
  );
  const [search, setSearch] = useState(INITIAL_SEARCH_STATE);

  // Refs hold the "current request" bookkeeping. They are refs (not state) so the
  // IntersectionObserver callback always sees fresh values and so guarding against
  // duplicate requests does not wait for a re-render.
  const searchIdRef = useRef(0); // bumps on every new search; stale responses are dropped
  const inFlightRef = useRef(false);
  const requestedPagesRef = useRef(new Set());
  const pagingRef = useRef({ query: '', page: 0, totalPages: 0 });
  const restoredRef = useRef(false);

  const runSearch = useCallback(async (rawQuery) => {
    const query = rawQuery.trim();
    if (!query) return;

    // A new search resets pagination completely.
    const searchId = ++searchIdRef.current;
    requestedPagesRef.current = new Set([1]);
    pagingRef.current = { query, page: 0, totalPages: 0 };
    inFlightRef.current = true;

    setSearchQuery(query);
    setStoredValue(STORAGE_KEYS.LAST_SEARCH, query);
    setSearch({ ...INITIAL_SEARCH_STATE, hasSearched: true, loading: true });

    try {
      const data = await searchMovies(query, 1);
      if (searchId !== searchIdRef.current) return; // a newer search replaced this one
      pagingRef.current = {
        query,
        page: data.page,
        totalPages: data.totalPages,
      };
      setSearch((state) => ({
        ...state,
        results: mergeUnique([], data.results),
        page: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
        loading: false,
      }));
    } catch (err) {
      if (searchId !== searchIdRef.current) return;
      requestedPagesRef.current.delete(1);
      setSearch((state) => ({ ...state, loading: false, error: err.message }));
    } finally {
      if (searchId === searchIdRef.current) inFlightRef.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    const { query, page, totalPages } = pagingRef.current;
    const nextPage = page + 1;

    // Guards: nothing to load, already loading, no more pages, or page already requested.
    if (
      !query ||
      page === 0 ||
      nextPage > totalPages ||
      inFlightRef.current ||
      requestedPagesRef.current.has(nextPage)
    ) {
      return;
    }

    const searchId = searchIdRef.current;
    inFlightRef.current = true;
    requestedPagesRef.current.add(nextPage);
    setSearch((state) => ({ ...state, loadingMore: true, loadMoreError: null }));

    try {
      const data = await searchMovies(query, nextPage);
      if (searchId !== searchIdRef.current) return;
      pagingRef.current = { query, page: data.page, totalPages: data.totalPages };
      setSearch((state) => ({
        ...state,
        results: mergeUnique(state.results, data.results), // keep previous results
        page: data.page,
        totalPages: data.totalPages,
        loadingMore: false,
      }));
    } catch (err) {
      if (searchId !== searchIdRef.current) return;
      requestedPagesRef.current.delete(nextPage); // allow a manual retry
      setSearch((state) => ({
        ...state,
        loadingMore: false,
        loadMoreError: err.message,
      }));
    } finally {
      if (searchId === searchIdRef.current) inFlightRef.current = false;
    }
  }, []);

  /** Re-runs the persisted last search once per app session (e.g. after a refresh). */
  const restoreLastSearch = useCallback(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const last = getStoredValue(STORAGE_KEYS.LAST_SEARCH, '');
    if (last) runSearch(last);
  }, [runSearch]);

  const clearSearch = useCallback(() => {
    searchIdRef.current += 1; // invalidate anything still in flight
    inFlightRef.current = false;
    requestedPagesRef.current = new Set();
    pagingRef.current = { query: '', page: 0, totalPages: 0 };
    restoredRef.current = true;
    setSearchQuery('');
    removeStoredValue(STORAGE_KEYS.LAST_SEARCH);
    setSearch(INITIAL_SEARCH_STATE);
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      toggleTheme,
      favorites,
      favoriteIds,
      toggleFavorite,
      trending,
      loadTrending,
      searchQuery,
      search,
      hasMore: search.page > 0 && search.page < search.totalPages,
      runSearch,
      loadMore,
      restoreLastSearch,
      clearSearch,
    }),
    [
      themeMode,
      toggleTheme,
      favorites,
      favoriteIds,
      toggleFavorite,
      trending,
      loadTrending,
      searchQuery,
      search,
      runSearch,
      loadMore,
      restoreLastSearch,
      clearSearch,
    ]
  );

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

export function useMovies() {
  const context = useContext(MovieContext);
  if (!context) throw new Error('useMovies must be used inside <MovieProvider>');
  return context;
}
