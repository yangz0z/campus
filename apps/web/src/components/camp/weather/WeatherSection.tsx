'use client';

import { useEffect, useState } from 'react';
import type { DailyForecast, WeatherForecast } from '@campus/shared';
import { calcDaysBetween, isDateInRange, parseDateInfo } from '@campus/shared';
import { getWeatherForecast } from '@/actions/weather';
import { useGeolocation } from '@/hooks/useGeolocation';

interface WeatherSectionProps {
  campLocation: string | null;
  startDate: string;
  endDate: string;
  initialForecast: WeatherForecast | null;
}

export default function WeatherSection({ campLocation, startDate, endDate, initialForecast }: WeatherSectionProps) {
  const needGeo = !campLocation;
  const geo = useGeolocation(needGeo);
  const [forecast, setForecast] = useState<WeatherForecast | null>(initialForecast);
  const [loading, setLoading] = useState(!initialForecast && needGeo);

  useEffect(() => {
    if (initialForecast || !needGeo) return;
    if (geo.loading) return;
    if (!geo.coords) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const campDays = calcDaysBetween(startDate, endDate);

    getWeatherForecast(geo.coords, Math.min(campDays, 14)).then((data) => {
      setForecast(data);
      setLoading(false);
    });
  }, [initialForecast, needGeo, geo.loading, geo.coords, startDate, endDate]);

  if (loading) {
    return (
      <div className="mt-2 flex gap-2 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[72px] w-[64px] shrink-0 animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!forecast || forecast.forecast.length === 0) return null;

  const campDays = forecast.forecast.filter((day) =>
    isDateInRange(day.date, startDate, endDate),
  );

  const displayDays = campDays.length > 0 ? campDays : forecast.forecast;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {displayDays.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}

function DayCard({ day }: { day: DailyForecast }) {
  const { month, day: dayNum, weekday, isWeekend } = parseDateInfo(day.date);

  return (
    <div className="flex w-[60px] shrink-0 flex-col items-center rounded-xl bg-white/60 px-1 py-2">
      <span className={`text-[10px] font-medium ${isWeekend ? 'text-red-400' : 'text-gray-400'}`}>
        {month}/{dayNum} {weekday}
      </span>
      {day.conditionIcon && (
        <img
          src={day.conditionIcon.startsWith('//') ? `https:${day.conditionIcon}` : day.conditionIcon}
          alt={day.conditionText}
          width={28}
          height={28}
          className="my-0.5"
        />
      )}
      <span className="text-[11px] font-semibold text-gray-700">
        {Math.round(day.maxTempC)}°
      </span>
      <span className="text-[10px] text-gray-400">
        {Math.round(day.minTempC)}°
      </span>
      {day.chanceOfRain > 0 && (
        <span className="mt-0.5 text-[9px] text-blue-400">
          {day.chanceOfRain}%
        </span>
      )}
    </div>
  );
}
