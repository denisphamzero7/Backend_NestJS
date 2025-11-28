import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
@Injectable()
export class WeatherService {
private readonly apiUrl: string;
private readonly apikey: string;
constructor (private configService: ConfigService){
  this.apiUrl =this.configService.get('OPENWEATHER_API_BASE_URL');
  this.apikey = this.configService.get('OPENWEATHER_API_KEY');
}

async getCurrentWeather(lat: number, lon: number) {
    const url = `${this.apiUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apikey}&units=metric&lang=vi`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      
      // Định dạng lại dữ liệu cho ứng dụng Flutter (tối ưu hóa)
      return {
        temperature: data.main.temp,
        description: data.weather[0].description,
        iconCode: data.weather[0].icon,
        cityName: data.name, // Tên thành phố do OpenWeatherMap cung cấp
      };
      
    } catch (error) {
      console.error('Lỗi khi gọi OpenWeatherMap:', error.message);
      throw new InternalServerErrorException('Không thể tải dữ liệu thời tiết bên ngoài.');
    }
  }



  create(createWeatherDto: CreateWeatherDto) {
    return 'This action adds a new weather';
  }

  findAll() {
    return `This action returns all weather`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weather`;
  }

  update(id: number, updateWeatherDto: UpdateWeatherDto) {
    return `This action updates a #${id} weather`;
  }

  remove(id: number) {
    return `This action removes a #${id} weather`;
  }
}
