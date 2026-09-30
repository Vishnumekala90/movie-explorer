import { useEffect, useRef } from 'react';

/**
 * Calls `onIntersect` whenever the returned ref's element scrolls into view.
 * Attach the ref to a "sentinel" element placed after the last item.
 *
 * - `enabled` switches observing on/off (e.g. while loading or when there are no
 *   more pages).
 * - `trigger` is any value that changes after each batch of content is loaded
 *   (we pass the current page number). A new IntersectionObserver is created
 *   whenever it changes, and a new observer immediately reports whether the sentinel
 *   is currently visible. Without this, a fast response can be rendered in the same
 *   frame in which the sentinel leaves and re-enters the viewport; the old observer
 *   would see no change and the next page would never load.
 */
export default function useInfiniteScroll({ onIntersect, enabled, trigger }) {
  const sentinelRef = useRef(null);
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin: '300px' } // start loading a little before the user hits the bottom
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, trigger]);

  return sentinelRef;
}
