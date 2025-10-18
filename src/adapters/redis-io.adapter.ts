import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions } from 'socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { RedisClientType } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  // SỬA LỖI: Khai báo thuộc tính adapterConstructor trước khi sử dụng
  private adapterConstructor: ReturnType<typeof createAdapter>;

  // SỬA LỖI: Đảm bảo constructor nhận đủ 3 tham số như khi gọi trong main.ts
  constructor(
    app: INestApplicationContext,
    private readonly pubClient: RedisClientType,
    private readonly subClient: RedisClientType,
  ) {
    super(app);
    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}