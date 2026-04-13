import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Public()
  @Get('forecast')
  async getForecast(
    @Query('location') location: string,
    @Query('days') days?: string,
  ) {
    if (!location?.trim()) {
      throw new BadRequestException('location is required');
    }

    const numDays = Math.max(1, Math.min(14, Number(days) || 3));
    const forecast = await this.weatherService.getForecast(location.trim(), numDays);

    return { forecast };
  }
}
