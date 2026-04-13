'use client';

import type { DailyForecast, WeatherForecast } from '@campus/shared';
import { isDateInRange } from '@campus/shared';

interface WeatherBadgeProps {
  forecast: WeatherForecast | null;
  startDate: string;
  endDate: string;
}

const RAIN_SNOW_KEYWORDS = ['rain', 'snow', '비', '눈', '소나기', 'sleet', 'drizzle'];

function isRainOrSnow(day: DailyForecast): boolean {
  const text = day.conditionText.toLowerCase();
  return RAIN_SNOW_KEYWORDS.some((kw) => text.includes(kw)) || day.chanceOfRain >= 50;
}

export default function WeatherBadge({ forecast, startDate, endDate }: WeatherBadgeProps) {
  if (!forecast) return null;

  const campDays = forecast.forecast.filter((d) =>
    isDateInRange(d.date, startDate, endDate),
  );

  if (campDays.length === 0) return null;

  const alertDay = campDays.find(isRainOrSnow);

  if (alertDay) {
    const iconUrl = alertDay.conditionIcon?.startsWith('//')
      ? `https:${alertDay.conditionIcon}`
      : alertDay.conditionIcon;

    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">
        {iconUrl ? (
          <img src={iconUrl} alt={alertDay.conditionText} width={16} height={16} className="shrink-0" />
        ) : null}
        {alertDay.conditionText}
      </span>
    );
  }

  const firstDay = campDays[0];
  const iconUrl = firstDay.conditionIcon?.startsWith('//')
    ? `https:${firstDay.conditionIcon}`
    : firstDay.conditionIcon;

  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">
      {iconUrl ? (
        <img src={iconUrl} alt={firstDay.conditionText} width={16} height={16} className="shrink-0" />
      ) : null}
      {Math.round(firstDay.maxTempC)}°
    </span>
  );
}
