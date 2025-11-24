import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

export class CustomIoAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  // Phương thức này được gọi khi NestJS tạo server Socket.IO
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, {
      ...options,
      // Bổ sung cấu hình CORS trực tiếp cho Socket.IO
      cors: {
        origin: '*', // Cho phép mọi kết nối (hoặc chỉ định domain của bạn)
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Thêm namespace nếu nó không được xác định trong Gateway (nhưng trong code của bạn thì đã có)
    });
    return server;
  }
}