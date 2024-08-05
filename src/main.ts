import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // Parse JSON body
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // Remove unwanted data from json payloads into the server
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Set Json payload limit to 5mb
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Add logger to server to handle logging
  // app.useLogger(app.get(Logger));

  // Enable cors to connect from required servers
  app.enableCors();
  await app.listen(process.env.PORT || 3500);
}
bootstrap();
