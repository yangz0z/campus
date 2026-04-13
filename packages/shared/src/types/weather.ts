export interface WeatherForecast {
  location: string;
  current: WeatherInfo;
  forecast: DailyForecast[];
}

export interface WeatherInfo {
  tempC: number;
  conditionText: string;
  conditionIcon: string;
}

export interface DailyForecast {
  date: string;
  maxTempC: number;
  minTempC: number;
  conditionText: string;
  conditionIcon: string;
  chanceOfRain: number;
}
