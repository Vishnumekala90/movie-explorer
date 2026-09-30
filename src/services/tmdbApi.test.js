// Tests the user-facing error messages produced by the API layer.
// No network is used: status codes are simulated on fake Axios errors, and the
// "missing API key" path is rejected by the request interceptor before any request.

describe('tmdbApi error handling', () => {
  let api;

  beforeEach(() => {
    jest.resetModules();
    process.env.REACT_APP_TMDB_API_KEY = ''; // simulate an unconfigured key
    api = require('./tmdbApi');
  });

  const fakeAxiosError = (status) => ({
    message: 'Request failed with status code ' + status,
    response: status ? { status } : undefined,
  });

  test.each([
    [401, /API key/i],
    [404, /could not find/i],
    [429, /too many requests/i],
    [500, /problems at the moment/i],
    [503, /problems at the moment/i],
    [400, /something went wrong/i],
  ])('status %s maps to a friendly message', (status, pattern) => {
    const error = api.toApiError(fakeAxiosError(status));
    expect(error).toBeInstanceOf(api.ApiError);
    expect(error.message).toMatch(pattern);
    expect(error.message).not.toMatch(/status code|axios/i); // never raw technical text
  });

  test('no response (offline / timeout) maps to a network error message', () => {
    expect(api.toApiError(fakeAxiosError(undefined)).message).toMatch(/network error/i);
  });

  test('a missing API key fails fast with setup instructions', async () => {
    await expect(api.getTrendingMovies()).rejects.toThrow(/REACT_APP_TMDB_API_KEY/);
    await expect(api.searchMovies('Batman', 1)).rejects.toThrow(/API key is missing/i);
  });
});
