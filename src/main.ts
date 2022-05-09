import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    //Unwanted and invalid properties
    //when creating new users (registering !)
    whitelist: true,
    //If enabled it will return a bad request
    forbidNonWhitelisted: true,
    transform: true,

  }));

  app.use(cookieParser());

  //Setup for "Swagger" testing
  const config = new DocumentBuilder()
    .setTitle('Geotagger')
    .setDescription('The second project in the "SkillUp Mentor" program called: 02-guess-locations. User can signup and add locations where they ')
    .setVersion('WIP')
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

  //Access-Control-Allow-Origin
  var cors = require('cors');
  app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
  }));

  await app.listen(process.env.APP_PORT);
}
bootstrap();
