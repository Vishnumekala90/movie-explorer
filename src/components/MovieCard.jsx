import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import MovieIcon from '@mui/icons-material/Movie';
import { useMovies } from '../context/MovieContext';
import { formatRating, getImageUrl, getReleaseYear } from '../utils/movieHelpers';

/** Clean placeholder used when a poster is missing or fails to load. */
function PosterFallback() {
  return (
    <Box
      sx={{
        aspectRatio: '2 / 3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        bgcolor: 'action.hover',
        color: 'text.secondary',
      }}
    >
      <MovieIcon fontSize="large" />
      <Typography variant="caption">No poster</Typography>
    </Box>
  );
}

/** Reusable card: poster, title, release year, rating and a favorite toggle. */
export default function MovieCard({ movie }) {
  const { favoriteIds, toggleFavorite } = useMovies();
  const [imageFailed, setImageFailed] = useState(false);

  const posterUrl = getImageUrl(movie.poster_path);
  const year = getReleaseYear(movie.release_date);
  const isFavorite = favoriteIds.has(movie.id);
  const favoriteLabel = isFavorite
    ? `Remove ${movie.title} from favorites`
    : `Add ${movie.title} to favorites`;

  return (
    <Card sx={{ position: 'relative', height: '100%' }}>
      <CardActionArea
        component={RouterLink}
        to={`/movie/${movie.id}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {posterUrl && !imageFailed ? (
          <CardMedia
            component="img"
            image={posterUrl}
            alt={`${movie.title} poster`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            sx={{ aspectRatio: '2 / 3', objectFit: 'cover' }}
          />
        ) : (
          <PosterFallback />
        )}
        <CardContent sx={{ flexGrow: 1, p: { xs: 1.25, sm: 2 } }}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 600,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {movie.title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              {year ?? 'Release date unknown'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatRating(movie.vote_average)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>

      {/* Sits outside the CardActionArea so we never nest a button inside a link. */}
      <Tooltip title={favoriteLabel}>
        <IconButton
          onClick={() => toggleFavorite(movie)}
          aria-label={favoriteLabel}
          aria-pressed={isFavorite}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: isFavorite ? 'error.light' : 'common.white',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
          }}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>
    </Card>
  );
}
