import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './authentication/auth.module';
import { Password } from './models/password/entities/password.entity';
import { PasswordModule } from './models/password/password.module';
import { User } from './models/users/entities/user.entity';
import { UserModule } from './models/users/user.module';

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
      entities: [User, Password],
      autoLoadEntities: true,
      //NOTICE: Disable in production!
      synchronize: true,
    }),


    //My modules
    AuthModule, UserModule, PasswordModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
