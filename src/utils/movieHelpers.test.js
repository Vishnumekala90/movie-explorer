import {
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getImageUrl,
  getReleaseYear,
  pickTrailer,
} from './movieHelpers';

describe('movieHelpers', () => {
  test('getImageUrl builds a TMDb URL or returns null', () => {
    expect(getImageUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg');
    expect(getImageUrl('/abc.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
    expect(getImageUrl(null)).toBeNull();
  });

  test('getReleaseYear handles missing and invalid dates', () => {
    expect(getReleaseYear('2010-07-16')).toBe('2010');
    expect(getReleaseYear('')).toBeNull();
    expect(getReleaseYear(undefined)).toBeNull();
    expect(getReleaseYear('abcd-01-01')).toBeNull();
  });

  test('formatRating shows N/A for unrated movies', () => {
    expect(formatRating(7.456)).toBe('7.5');
    expect(formatRating(0)).toBe('N/A');
  });

  test('formatReleaseDate and formatRuntime', () => {
    expect(formatReleaseDate('2010-07-16')).toBe('July 16, 2010');
    expect(formatReleaseDate('')).toBeNull();
    expect(formatRuntime(128)).toBe('2h 8m');
    expect(formatRuntime(45)).toBe('45m');
    expect(formatRuntime(0)).toBeNull();
  });

  test('pickTrailer prefers official YouTube trailers and ignores other sites', () => {
    const videos = [
      { key: 'a', site: 'Vimeo', type: 'Trailer', official: true },
      { key: 'b', site: 'YouTube', type: 'Teaser', official: true },
      { key: 'c', site: 'YouTube', type: 'Trailer', official: false },
      { key: 'd', site: 'YouTube', type: 'Trailer', official: true },
    ];
    expect(pickTrailer(videos).key).toBe('d');
    expect(pickTrailer(videos.slice(0, 3)).key).toBe('c');
    expect(pickTrailer(videos.slice(0, 2)).key).toBe('b');
    expect(pickTrailer([videos[0]])).toBeNull();
    expect(pickTrailer([])).toBeNull();
  });
});
