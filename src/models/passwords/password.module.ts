import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/authentication/auth.module";
import { User } from "../users/entities/user.entity";
import { Password } from "./entities/password.entity";
import { PasswordController } from "./password.controller";
import { PasswordService } from "./password.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Password]),
        MailerModule.forRoot({
            transport: {
                host: '0.0.0.0',
                port: 1025,
            },
            defaults: {
                from: 'admin@Geotagger.com',
            }
        }),

        //Imported modules
        AuthModule,
    ],
    controllers: [PasswordController],
    providers: [PasswordService],
})
export class PasswordModule { }