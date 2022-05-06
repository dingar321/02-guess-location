import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  //Setup for "Swagger" testing
  const config = new DocumentBuilder()
    .setTitle('02-guess-locations')
    .setDescription('The second project in the "SkillUp Mentor" program')
    .setVersion('0.1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
      'jwtToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  app.enableCors({
    credentials: true,
    origin: 'http://localhost:3000'
  })

  await app.listen(process.env.APP_PORT);
}
bootstrap();
