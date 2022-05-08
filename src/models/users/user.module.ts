import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/authentication/auth.module";
import { ImageUploadeService } from "src/utils/S3Service/image-uploade.service";
import { User } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),

        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' }
        }),

        //Imported modules
        AuthModule,
    ],
    controllers: [UserController],
    providers: [UserService, ImageUploadeService],
})
export class UserModule { }