import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './authentication/auth.module';
import { User } from './models/users/entities/user.entity';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
    }),


    //Database config !
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESS_HOST,
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRESS_DATABASE,
      entities: [User],
      autoLoadEntities: true,
      //NOTICE: Disable in production!
      synchronize: true,
    }),


    //My modules
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
