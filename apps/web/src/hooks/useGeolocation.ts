'use client';

import { useEffect, useState } from 'react';

interface GeolocationState {
  coords: string | null; // "lat,lon" 형식
  loading: boolean;
}

export function useGeolocation(enabled: boolean): GeolocationState {
  const [state, setState] = useState<GeolocationState>({ coords: null, loading: enabled });

  useEffect(() => {
    if (!enabled) {
      setState({ coords: null, loading: false });
      return;
    }

    if (!navigator.geolocation) {
      setState({ coords: null, loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: `${pos.coords.latitude},${pos.coords.longitude}`,
          loading: false,
        });
      },
      () => {
        setState({ coords: null, loading: false });
      },
      { timeout: 5000 },
    );
  }, [enabled]);

  return state;
}
