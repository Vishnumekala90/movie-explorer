import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MovieDetailsView from '../components/MovieDetails';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getMovieCredits, getMovieDetails, getMovieVideos } from '../services/tmdbApi';

const INITIAL_STATE = {
  loading: true,
  error: null,
  movie: null,
  cast: [],
  castError: null,
  videos: [],
  videosError: null,
};

/** Route: /movie/:id. Loads details, cast and videos for one movie. */
export default function MovieDetailsPage() {
  const { id } = useParams();
  const [state, setState] = useState(INITIAL_STATE);

  const load = useCallback(async () => {
    setState(INITIAL_STATE);

    // The three requests are independent, so run them in parallel. Only the main
    // details are essential: a failed cast or video request degrades gracefully.
    const [details, credits, videos] = await Promise.allSettled([
      getMovieDetails(id),
      getMovieCredits(id),
      getMovieVideos(id),
    ]);

    if (details.status === 'rejected') {
      setState({ ...INITIAL_STATE, loading: false, error: details.reason.message });
      return;
    }
    setState({
      loading: false,
      error: null,
      movie: details.value,
      cast: credits.status === 'fulfilled' ? credits.value : [],
      castError:
        credits.status === 'rejected' ? 'Cast information could not be loaded.' : null,
      videos: videos.status === 'fulfilled' ? videos.value : [],
      videosError:
        videos.status === 'rejected' ? 'Trailer information could not be loaded.' : null,
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Home
      </Button>

      {state.loading && <Loading label="Loading movie details..." />}
      {state.error && <ErrorMessage message={state.error} onRetry={load} />}
      {state.movie && (
        <MovieDetailsView
          movie={state.movie}
          cast={state.cast}
          castError={state.castError}
          videos={state.videos}
          videosError={state.videosError}
        />
      )}
    </Box>
  );
}
