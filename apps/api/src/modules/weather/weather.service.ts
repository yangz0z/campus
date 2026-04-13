import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nowMs } from '@campus/shared';
import type { WeatherForecast } from '@campus/shared';

interface CacheEntry {
  data: WeatherForecast;
  expiresAt: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string | undefined;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 60분

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
    if (!this.apiKey) {
      this.logger.warn('WEATHER_API_KEY is not set. Weather features will be disabled.');
    }
  }

  async getForecast(location: string, days: number): Promise<WeatherForecast | null> {
    if (!this.apiKey) return null;

    const cacheKey = `${location}:${days}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > nowMs()) {
      return cached.data;
    }

    try {
      const url = new URL('https://api.weatherapi.com/v1/forecast.json');
      url.searchParams.set('key', this.apiKey);
      url.searchParams.set('q', location);
      url.searchParams.set('days', String(Math.min(days, 14)));
      url.searchParams.set('lang', 'ko');

      const res = await fetch(url.toString());
      if (!res.ok) {
        this.logger.warn(`WeatherAPI returned ${res.status} for location "${location}"`);
        return null;
      }

      const raw = await res.json();
      const forecast = this.transform(raw);

      this.cache.set(cacheKey, { data: forecast, expiresAt: nowMs() + this.CACHE_TTL });
      return forecast;
    } catch (error) {
      this.logger.error('Failed to fetch weather', error);
      return null;
    }
  }

  private transform(raw: any): WeatherForecast {
    return {
      location: raw.location?.name ?? '',
      current: {
        tempC: raw.current?.temp_c ?? 0,
        conditionText: raw.current?.condition?.text ?? '',
        conditionIcon: raw.current?.condition?.icon ?? '',
      },
      forecast: (raw.forecast?.forecastday ?? []).map((day: any) => ({
        date: day.date,
        maxTempC: day.day?.maxtemp_c ?? 0,
        minTempC: day.day?.mintemp_c ?? 0,
        conditionText: day.day?.condition?.text ?? '',
        conditionIcon: day.day?.condition?.icon ?? '',
        chanceOfRain: day.day?.daily_chance_of_rain ?? 0,
      })),
    };
  }
}
