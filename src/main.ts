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
    .setDescription
    (`
    The second project in the "SkillUp Mentor" program. 
    
    ● Application description:
        - The full-stack application allows users after signing up and/or signing in to uploade a picture and mark its exact location on the map where it was taken. Authenticated users 
          can then try and guess where the image was taken by selecting a point on the map. As a result the app returns the close their chosen location was.
    
    ● Additional functionality:
        - Get each locations guesses
        - Get each users guesses and locations 
        - If a user forgets their password they can request a password reset link.
        - Authenticated users can change their password, information and profile picture

    ● Technical information:
        - JWT HttpOnly cookie for authorization
        - Pictures get saves on a AWS S3 bucket

    `)
    .setVersion('WIP')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  //Access-Control-Allow-Origin
  var cors = require('cors');
  app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
  }));

  await app.listen(process.env.APP_PORT);
}
bootstrap();
