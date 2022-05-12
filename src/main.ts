import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.use(cookieParser());

  //Setup for "Swagger" testing
  const config = new DocumentBuilder()
    .setTitle('Geotagger')
    .setDescription('The second project in the "SkillUp Mentor" program called: 02-guess-locations. User can signup and add locations where they ')
    .setVersion('WIP')
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
