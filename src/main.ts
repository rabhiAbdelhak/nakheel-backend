import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes( new ValidationPipe({
    skipMissingProperties: true,
    errorHttpStatusCode: 406,
  }));
  app.enableCors();
  app.setGlobalPrefix('/api')
  const config = new DocumentBuilder()
    .setTitle('Nakheel Managment API')
    .setDescription('The Nakheel Management Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api_swagger', app, document);
  app.use(cookieParser());
  await app.listen(3333);
}
bootstrap();
