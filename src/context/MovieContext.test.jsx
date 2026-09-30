import { act, renderHook, waitFor } from '@testing-library/react';
import { MovieProvider, useMovies } from './MovieContext';
import { searchMovies } from '../services/tmdbApi';

// The API layer is mocked so these tests exercise only the context logic
// (pagination guards, favorites, persistence) and never hit the network.
jest.mock('../services/tmdbApi', () => ({
  searchMovies: jest.fn(),
  getTrendingMovies: jest.fn(),
}));

const wrapper = ({ children }) => <MovieProvider>{children}</MovieProvider>;
const makeMovies = (start, count) =>
  Array.from({ length: count }, (_, i) => ({ id: start + i, title: `Movie ${start + i}` }));

// Three pages: 20 + 20 + 10 movies.
function mockThreePages() {
  searchMovies.mockImplementation(async (query, page) => ({
    results: makeMovies((page - 1) * 20 + 1, page < 3 ? 20 : 10),
    page,
    totalPages: 3,
    totalResults: 50,
  }));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('search + infinite scroll', () => {
  test('loads pages one at a time, preserves results and stops at the last page', async () => {
    mockThreePages();
    const { result } = renderHook(() => useMovies(), { wrapper });

    await act(() => result.current.runSearch('Batman'));
    expect(result.current.search.results).toHaveLength(20);
    expect(result.current.hasMore).toBe(true);

    await act(() => result.current.loadMore());
    expect(result.current.search.results).toHaveLength(40);

    await act(() => result.current.loadMore());
    expect(result.current.search.results).toHaveLength(50);
    expect(result.current.hasMore).toBe(false);

    await act(() => result.current.loadMore()); // nothing left to load
    expect(searchMovies.mock.calls.map(([, page]) => page)).toEqual([1, 2, 3]);
  });

  test('never requests the same page twice when loadMore fires repeatedly', async () => {
    mockThreePages();
    const { result } = renderHook(() => useMovies(), { wrapper });
    await act(() => result.current.runSearch('Batman'));

    await act(async () => {
      // Simulates the observer firing several times before the response arrives.
      await Promise.all([
        result.current.loadMore(),
        result.current.loadMore(),
        result.current.loadMore(),
      ]);
    });

    expect(searchMovies.mock.calls.filter(([, page]) => page === 2)).toHaveLength(1);
    expect(result.current.search.results).toHaveLength(40);
  });

  test('a new search resets pagination and results', async () => {
    mockThreePages();
    const { result } = renderHook(() => useMovies(), { wrapper });
    await act(() => result.current.runSearch('Batman'));
    await act(() => result.current.loadMore());

    await act(() => result.current.runSearch('Joker'));
    expect(result.current.search.results).toHaveLength(20);
    expect(result.current.search.page).toBe(1);
    expect(searchMovies).toHaveBeenLastCalledWith('Joker', 1);
  });

  test('ignores a stale response from a previous search', async () => {
    let resolveFirst;
    searchMovies
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveFirst = resolve; })
      )
      .mockImplementationOnce(async () => ({
        results: makeMovies(100, 3), page: 1, totalPages: 1, totalResults: 3,
      }));
    const { result } = renderHook(() => useMovies(), { wrapper });

    let first;
    act(() => { first = result.current.runSearch('slow'); });
    await act(() => result.current.runSearch('fast'));
    await act(async () => {
      resolveFirst({ results: makeMovies(1, 20), page: 1, totalPages: 5, totalResults: 100 });
      await first;
    });

    expect(result.current.search.results.map((m) => m.id)).toEqual([100, 101, 102]);
  });

  test('keeps previous results and exposes a message when a later page fails', async () => {
    mockThreePages();
    const { result } = renderHook(() => useMovies(), { wrapper });
    await act(() => result.current.runSearch('Batman'));

    searchMovies.mockRejectedValueOnce(new Error('Network error. Please try again.'));
    await act(() => result.current.loadMore());
    expect(result.current.search.loadMoreError).toBe('Network error. Please try again.');
    expect(result.current.search.results).toHaveLength(20);

    // Retrying the same page is allowed after a failure.
    mockThreePages();
    await act(() => result.current.loadMore());
    expect(result.current.search.results).toHaveLength(40);
    expect(result.current.search.loadMoreError).toBeNull();
  });

  test('surfaces first-page errors and ignores empty queries', async () => {
    searchMovies.mockRejectedValueOnce(new Error('TMDb rejected the API key.'));
    const { result } = renderHook(() => useMovies(), { wrapper });

    await act(() => result.current.runSearch('   '));
    expect(searchMovies).not.toHaveBeenCalled();

    await act(() => result.current.runSearch('Batman'));
    expect(result.current.search.error).toBe('TMDb rejected the API key.');
  });
});

describe('last search persistence', () => {
  test('stores the last query and restores it on the next app start', async () => {
    mockThreePages();
    const first = renderHook(() => useMovies(), { wrapper });
    await act(() => first.result.current.runSearch('  Batman '));
    expect(JSON.parse(window.localStorage.getItem('movieExplorer:lastSearch'))).toBe('Batman');
    first.unmount();

    searchMovies.mockClear();
    const second = renderHook(() => useMovies(), { wrapper });
    expect(second.result.current.searchQuery).toBe('Batman');
    act(() => second.result.current.restoreLastSearch());
    await waitFor(() => expect(second.result.current.search.results).toHaveLength(20));
    expect(searchMovies).toHaveBeenCalledWith('Batman', 1);
  });

  test('clearSearch removes the stored query', async () => {
    mockThreePages();
    const { result } = renderHook(() => useMovies(), { wrapper });
    await act(() => result.current.runSearch('Batman'));
    act(() => result.current.clearSearch());
    expect(window.localStorage.getItem('movieExplorer:lastSearch')).toBeNull();
    expect(result.current.search.hasSearched).toBe(false);
  });
});

describe('favorites', () => {
  const movie = {
    id: 7, title: 'Seven', poster_path: '/s.jpg', release_date: '1995-09-22',
    vote_average: 8.3, overview: 'not stored',
  };

  test('add, remove, no duplicates and persistence', () => {
    const { result, unmount } = renderHook(() => useMovies(), { wrapper });

    act(() => result.current.toggleFavorite(movie));
    expect(result.current.favoriteIds.has(7)).toBe(true);
    expect(result.current.favorites).toHaveLength(1);

    const stored = JSON.parse(window.localStorage.getItem('movieExplorer:favorites'));
    expect(stored).toEqual([
      { id: 7, title: 'Seven', poster_path: '/s.jpg', release_date: '1995-09-22', vote_average: 8.3 },
    ]);
    unmount();

    // "Refresh": a new provider reads the saved favorites.
    const reloaded = renderHook(() => useMovies(), { wrapper });
    expect(reloaded.result.current.favorites).toHaveLength(1);

    act(() => reloaded.result.current.toggleFavorite(movie)); // toggling again removes
    expect(reloaded.result.current.favorites).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem('movieExplorer:favorites'))).toEqual([]);
  });

  test('survives corrupted localStorage data', () => {
    window.localStorage.setItem('movieExplorer:favorites', '{not json');
    const { result } = renderHook(() => useMovies(), { wrapper });
    expect(result.current.favorites).toEqual([]);
  });
});

describe('theme', () => {
  test('toggles and persists the theme mode', () => {
    const { result } = renderHook(() => useMovies(), { wrapper });
    const initial = result.current.themeMode;
    act(() => result.current.toggleTheme());
    const next = initial === 'light' ? 'dark' : 'light';
    expect(result.current.themeMode).toBe(next);
    expect(JSON.parse(window.localStorage.getItem('movieExplorer:themeMode'))).toBe(next);
  });
});
