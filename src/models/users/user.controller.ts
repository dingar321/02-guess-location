import { Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { Request, Response } from 'express';
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/authentication/auth.service";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";

@ApiTags('user')
@Controller()
export class UserController {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService,
        private userService: UserService
    ) { }

    @ApiOperation({ summary: 'Change the logged in users password' })
    @Post('user/change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() request: Request): Promise<any> {
        try {
            const cookie = request.cookies['jwt'];

            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException();
            }

            const foundUser = await this.authService.findOneUserId(data.id)

            await this.userService.updatePassword(changePasswordDto, foundUser);

            return {
                message: 'password changed'
            };

        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}