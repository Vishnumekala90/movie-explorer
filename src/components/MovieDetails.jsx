import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import MovieIcon from '@mui/icons-material/Movie';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ErrorMessage from './ErrorMessage';
import { useMovies } from '../context/MovieContext';
import {
  formatRating,
  formatReleaseDate,
  formatRuntime,
  getImageUrl,
  pickTrailer,
} from '../utils/movieHelpers';

const MAX_CAST = 12;

/** Presentational view of one movie. Data fetching lives in pages/MovieDetails. */
export default function MovieDetails({ movie, cast, castError, videos, videosError }) {
  const { favoriteIds, toggleFavorite } = useMovies();
  const [showEmbed, setShowEmbed] = useState(false);

  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const releaseDate = formatReleaseDate(movie.release_date);
  const runtime = formatRuntime(movie.runtime);
  const genres = movie.genres ?? [];
  const isFavorite = favoriteIds.has(movie.id);
  const trailer = pickTrailer(videos);
  const topCast = (cast ?? []).slice(0, MAX_CAST);

  return (
    <Box>
      {/* Poster + main info: stacked on phones, side by side from "md" up */}
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 3, md: 4 },
          gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
        }}
      >
        <Box sx={{ maxWidth: { xs: 280, md: 'none' }, mx: { xs: 'auto', md: 0 }, width: '100%' }}>
          {posterUrl ? (
            <Box
              component="img"
              src={posterUrl}
              alt={`${movie.title} poster`}
              sx={{ width: '100%', borderRadius: 3, display: 'block', boxShadow: 4 }}
            />
          ) : (
            <Paper
              sx={{
                aspectRatio: '2 / 3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                color: 'text.secondary',
              }}
            >
              <MovieIcon fontSize="large" />
              <Typography variant="body2">No poster available</Typography>
            </Paper>
          )}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ overflowWrap: 'anywhere' }}>
            {movie.title}
          </Typography>
          {movie.tagline && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {movie.tagline}
            </Typography>
          )}

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', my: 2 }}>
            <Chip
              icon={<StarIcon />}
              color="warning"
              label={`${formatRating(movie.vote_average)} / 10`}
            />
            <Chip label={releaseDate ?? 'Release date unknown'} variant="outlined" />
            {runtime && <Chip label={runtime} variant="outlined" />}
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
            {genres.length > 0 ? (
              genres.map((genre) => <Chip key={genre.id} label={genre.name} color="primary" />)
            ) : (
              <Typography variant="body2" color="text.secondary">
                Genres not available
              </Typography>
            )}
          </Stack>

          <Typography variant="h6" component="h2" gutterBottom>
            Overview
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {movie.overview || 'No overview is available for this movie.'}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant={isFavorite ? 'outlined' : 'contained'}
              startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={() => toggleFavorite(movie)}
              aria-pressed={isFavorite}
            >
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </Button>
            {trailer && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<YouTubeIcon />}
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch trailer on YouTube
                </Button>
                <Button
                  variant="text"
                  startIcon={<PlayCircleIcon />}
                  onClick={() => setShowEmbed((shown) => !shown)}
                >
                  {showEmbed ? 'Hide trailer' : 'Play trailer here'}
                </Button>
              </>
            )}
          </Stack>

          {/* Missing trailer: explain instead of silently showing nothing */}
          {videosError && <ErrorMessage severity="warning" message={videosError} />}
          {!videosError && !trailer && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No trailer is available for this movie.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Embedded trailer (bonus): only loaded after the user asks for it */}
      {trailer && showEmbed && (
        <Box
          sx={{
            mt: 4,
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'common.black',
          }}
        >
          <Box
            component="iframe"
            src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
            title={`${movie.title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </Box>
      )}

      <Box component="section" sx={{ mt: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Cast
        </Typography>
        {castError && <ErrorMessage severity="warning" message={castError} />}
        {!castError && topCast.length === 0 && (
          <Typography color="text.secondary">Cast information is not available.</Typography>
        )}
        {topCast.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
                lg: 'repeat(6, minmax(0, 1fr))',
              },
            }}
          >
            {topCast.map((person) => (
              <Paper
                key={person.credit_id ?? person.id}
                sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}
              >
                <Avatar
                  src={getImageUrl(person.profile_path, 'w185') ?? undefined}
                  alt={person.name}
                  sx={{ width: 48, height: 48 }}
                >
                  {person.name?.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={person.name}>
                    {person.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    component="p"
                    title={person.character}
                  >
                    {person.character || 'Unknown role'}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
