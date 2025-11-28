import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';
import { Public } from 'src/decorator/customize';

@Controller('weather')
export class WeatherController {
  logger: any;
  Logger: any;
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }
@Public()
 @Get('current')
  async getWeather(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    // Đảm bảo lat và lon là số
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
        return { error: 'Tọa độ không hợp lệ' };
    }

    console.log(`Fetching weather for: ${latitude}, ${longitude}`);
    return this.weatherService.getCurrentWeather(latitude, longitude);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weatherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeatherDto: UpdateWeatherDto) {
    return this.weatherService.update(+id, updateWeatherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weatherService.remove(+id);
  }
}
