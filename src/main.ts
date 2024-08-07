import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Setting API Path
  // const apiPath = 'api';
  // app.setGlobalPrefix(apiPath);

  // Swagger Options
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nest-js Swagger Example API')
    .addGlobalParameters({
      in: 'header',
      required: true,
      name: 'x-project-header',
      schema: {
        example: 'some value',
      },
    })
    .setDescription('Swagger Example API API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  // Swagger path: http://localhost:3200/api/docs
  SwaggerModule.setup(`/docs`, app, document);
  await app.listen(process.env.PORT || 3500);
}
bootstrap();
