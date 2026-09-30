// Central TMDb API layer. Components never talk to Axios directly; they call the
// functions below and receive either clean data or an ApiError with a message that
// is safe to show to the user (raw Axios errors never reach the UI).

import axios from 'axios';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const PLACEHOLDER_KEY = 'your_api_key';

/** Error type whose `message` is always user-friendly. */
export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const client = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 10000,
  params: { language: 'en-US' },
});

// Attach the API key to every request, and fail early with a clear message when the
// developer forgot to configure it (instead of sending a request that is sure to 401).
client.interceptors.request.use((config) => {
  if (!API_KEY || API_KEY === PLACEHOLDER_KEY) {
    return Promise.reject(
      new ApiError(
        'The TMDb API key is missing. Add REACT_APP_TMDB_API_KEY to your .env file and restart the app.',
        401
      )
    );
  }
  config.params = { ...config.params, api_key: API_KEY };
  return config;
});

// Translate every failure into an ApiError with a friendly message.
client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
);

export function toApiError(error) {
  if (error instanceof ApiError) return error;

  const status = error.response?.status;

  if (status === 401) {
    return new ApiError(
      'TMDb rejected the API key. Please check that REACT_APP_TMDB_API_KEY is valid.',
      status
    );
  }
  if (status === 404) {
    return new ApiError('We could not find what you were looking for.', status);
  }
  if (status === 429) {
    return new ApiError(
      'Too many requests right now. Please wait a moment and try again.',
      status
    );
  }
  if (status >= 500) {
    return new ApiError(
      'TMDb is having problems at the moment. Please try again later.',
      status
    );
  }
  if (!error.response) {
    // No response at all: offline, DNS failure, CORS block or timeout.
    return new ApiError(
      'Network error. Please check your internet connection and try again.'
    );
  }
  return new ApiError('Something went wrong. Please try again.', status);
}

/** Trending movies of the week. */
export async function getTrendingMovies() {
  const { data } = await client.get('/trending/movie/week');
  return data.results;
}

/** One page of search results plus the pagination info needed for infinite scroll. */
export async function searchMovies(query, page = 1) {
  const { data } = await client.get('/search/movie', {
    params: { query, page, include_adult: false },
  });
  return {
    results: data.results,
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

export async function getMovieDetails(movieId) {
  const { data } = await client.get(`/movie/${movieId}`);
  return data;
}

export async function getMovieCredits(movieId) {
  const { data } = await client.get(`/movie/${movieId}/credits`);
  return data.cast;
}

export async function getMovieVideos(movieId) {
  const { data } = await client.get(`/movie/${movieId}/videos`);
  return data.results;
}

/** Genre id -> name list, used by the genre filter (bonus). */
export async function getGenres() {
  const { data } = await client.get('/genre/movie/list');
  return data.genres;
}
