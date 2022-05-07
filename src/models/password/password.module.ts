import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Password } from "./entities/password.entity";
import { PasswordController } from "./password.controller";
import { PasswordService } from "./password.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Password]),
        TypeOrmModule.forFeature([User]),
        MailerModule.forRoot({
            transport: {
                host: '0.0.0.0',
                port: 1025,
            },
            defaults: {
                from: 'admin@Geotagger.com',
            }
        }),
    ],
    controllers: [PasswordController],
    providers: [PasswordService],
})
export class PasswordModule { }