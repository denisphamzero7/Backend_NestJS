import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OnesignalService {
  private readonly logger = new Logger(OnesignalService.name);
  private readonly ONE_SIGNAL_APP_ID: string;
  private readonly ONE_SIGNAL_REST_API_KEY: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Lấy config từ file .env
    this.ONE_SIGNAL_APP_ID = this.configService.get<string>('ONE_SIGNAL_APP_ID');
    this.ONE_SIGNAL_REST_API_KEY = this.configService.get<string>('ONE_SIGNAL_REST_API_KEY');
  }

  /**
   * Gửi thông báo đến một External User ID cụ thể
   * @param externalUserId CCCD của cử tri (đã login OneSignal ở frontend)
   * @param heading Tiêu đề thông báo
   * @param content Nội dung thông báo
   * @param data Dữ liệu đính kèm (ví dụ: để điều hướng)
   */
  async sendNotificationToUser(
    externalUserId: string,
    heading: string,
    content: string,
    data: Record<string, any> = {},
  ) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${this.ONE_SIGNAL_REST_API_KEY}`,
    };

    const body = {
      app_id: this.ONE_SIGNAL_APP_ID,
      include_external_user_ids: [externalUserId],
      headings: { en: heading, vi: heading },
      contents: { en: content, vi: content },
      data: data, // Gửi thêm data nếu cần
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.onesignal.com/api/v1/notifications',
          body,
          { headers },
        ),
      );
      this.logger.log(`OneSignal notification sent to ${externalUserId}: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error sending OneSignal notification to ${externalUserId}`, error.response?.data || error.message);
      throw error;
    }
  }
}