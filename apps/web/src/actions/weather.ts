'use server';

import { serverFetch } from '@/lib/api-server';
import type { WeatherForecast } from '@campus/shared';

interface WeatherResponse {
  forecast: WeatherForecast | null;
}

export async function getWeatherForecast(
  location: string,
  days?: number,
): Promise<WeatherForecast | null> {
  try {
    const params = new URLSearchParams({ location });
    if (days) params.set('days', String(days));

    const { forecast } = await serverFetch<WeatherResponse>(
      `/weather/forecast?${params.toString()}`,
    );
    return forecast;
  } catch {
    return null;
  }
}
