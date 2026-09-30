// Small pure helpers for turning raw TMDb fields into display values.

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/** Returns a full TMDb image URL, or null when the movie has no image. */
export function getImageUrl(path, size = 'w342') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

/** "2010-07-16" -> "2010". Returns null for missing/invalid dates. */
export function getReleaseYear(releaseDate) {
  if (!releaseDate) return null;
  const year = releaseDate.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

/** TMDb ratings are 0-10. Unrated movies report 0, which we show as "N/A". */
export function formatRating(voteAverage) {
  return voteAverage ? voteAverage.toFixed(1) : 'N/A';
}

/** "2010-07-16" -> "July 16, 2010". */
export function formatReleaseDate(releaseDate) {
  if (!releaseDate) return null;
  const date = new Date(`${releaseDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 128 -> "2h 8m". */
export function formatRuntime(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

/**
 * Chooses the best YouTube video to show as "the trailer":
 * official trailers first, then any trailer, then teasers.
 */
export function pickTrailer(videos = []) {
  const youtube = videos.filter((video) => video.site === 'YouTube');
  return (
    youtube.find((v) => v.type === 'Trailer' && v.official) ||
    youtube.find((v) => v.type === 'Trailer') ||
    youtube.find((v) => v.type === 'Teaser') ||
    null
  );
}

/** Keeps only the fields we need so favorites stay small in localStorage. */
export function toFavoriteSnapshot(movie) {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path ?? null,
    release_date: movie.release_date ?? '',
    vote_average: movie.vote_average ?? 0,
  };
}
