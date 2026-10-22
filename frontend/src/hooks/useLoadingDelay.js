import { useState, useEffect } from 'react';

/**
 * Custom hook that returns true only after an action has been loading
 * for longer than the specified threshold (default 1000ms).
 *
 * @param {boolean} isLoading - Current loading / submitting state
 * @param {number} delayMs - Delay threshold in milliseconds (default 1000ms)
 * @returns {boolean} Whether the loading animation should be displayed
 */
export function useLoadingDelay(isLoading, delayMs = 1000) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer = null;

    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, delayMs);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading, delayMs]);

  return showLoader;
}

export default useLoadingDelay;
