// excel
import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { createClient } from 'redis'; 
import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const configService = app.get(ConfigService);
  // --- Cấu hình Redis Adapter ---
  const redisUrl = configService.get<string>('REDIS_URL');
  console.log(`Connecting to Redis at: ${redisUrl}`);
  
  const pubClient = createClient({ 
    url: redisUrl,
    socket: {
      tls: true,
      rejectUnauthorized: false,
      connectTimeout: 5000,
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.error('Redis connection failed: Max retries reached.');
          return new Error('Redis connection failed after 3 retries');
        }
        console.log(`Redis reconnect attempt #${retries}...`);
        return 1000;
      }
    }
  });
  
  pubClient.on('error', (err) => console.error('Redis PubClient Error:', err));
  
  const subClient = pubClient.duplicate();
  subClient.on('error', (err) => console.error('Redis SubClient Error:', err));

  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log('Successfully connected to Redis!');
  } catch (err) {
    console.error('Failed to establish connection to Redis:', err);
    throw err;
  }

  app.useWebSocketAdapter(new RedisIoAdapter(app, pubClient as any, subClient as any));

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  const port = configService.get<string>('PORT') || 3000;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });
  //config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });

   // app.use(helmet());
  await app.listen(port);
 
  console.log(`Server is running at http://localhost:${port}`);
}
bootstrap();
