'use client';

import type { WeatherForecast } from '@campus/shared';

interface WeatherBadgeProps {
  forecast: WeatherForecast | null;
  targetDate: string;
}

export default function WeatherBadge({ forecast, targetDate }: WeatherBadgeProps) {
  if (!forecast) return null;

  const day = forecast.forecast.find((d) => d.date === targetDate) ?? forecast.forecast[0];
  if (!day) return null;

  const iconUrl = day.conditionIcon?.startsWith('//')
    ? `https:${day.conditionIcon}`
    : day.conditionIcon;

  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">
      {iconUrl ? (
        <img src={iconUrl} alt={day.conditionText} width={16} height={16} className="shrink-0" />
      ) : null}
      {Math.round(day.maxTempC)}°
      {day.chanceOfRain > 20 && (
        <span className="text-blue-400">{day.chanceOfRain}%</span>
      )}
    </span>
  );
}
