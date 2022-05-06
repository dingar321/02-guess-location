import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/models/users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: 'D1FBED8EAEB7E37694B42C0BB7B4B93B275A44DB66436DBFEAE6D89BF80C57D5',
            signOptions: { expiresIn: '1d' }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }