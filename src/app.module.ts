import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './authentication/auth.module';
import { Guess } from './models/guesses/entities/guess.entity';
import { GuessModule } from './models/guesses/guess.module';
import { Location } from './models/locations/entities/location.entity';
import { LocationModule } from './models/locations/location.module';
import { Password } from './models/passwords/entities/password.entity';
import { PasswordModule } from './models/passwords/password.module';
import { User } from './models/users/entities/user.entity';
import { UserModule } from './models/users/user.module';
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),


    //Database config !
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESS_HOST,
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRESS_DATABASE,
      entities: [User, Password, Location, Guess],
      autoLoadEntities: true,
      //NOTICE: Disable in production!
      synchronize: true,
    }),


    //My modules
    AuthModule, UserModule,
    PasswordModule, LocationModule,
    GuessModule, PassportModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
