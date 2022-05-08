import { MailerService } from "@nestjs-modules/mailer";
import { Body, Controller, NotFoundException, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { PasswordService } from "./password.service";
import * as bcrypt from 'bcrypt';
import { AuthService } from "src/authentication/auth.service";
import { ChangePasswordDto } from "../users/dto/change-password.dto";
import { Request, Response } from 'express';
import { JwtService } from "@nestjs/jwt";

@ApiTags('password')
@Controller()
export class PasswordController {
    constructor(
        private passwordService: PasswordService,
        private mailerService: MailerService,
        private authService: AuthService,
    ) { }

    @ApiOperation({ summary: 'Get token for a forgotten password' })
    @Post('user/forgot-password')
    async forgot(@Body() forgotPasswordDto: ForgotPasswordDto) {
        const resetToken = Math.random().toString(20).substring(2, 12);
        await this.passwordService.create(forgotPasswordDto, resetToken)

        //Send an email
        const url = `http://localhost:3000/reset/${resetToken}`;

        await this.mailerService.sendMail({
            to: forgotPasswordDto.email,
            subject: 'Forgotten password, reset your password',
            html: `Click <a href="${url}">here<a> to reset your password`
        });

        return {
            message: 'Plase check your email'
        };
    }

    @ApiOperation({ summary: 'Use the token to change the forgotten password' })
    @Post('user/reset-password')
    async reset(@Body() resetPasswordDto: ResetPasswordDto) {

        const foundPasswordReset = await this.passwordService.findOneResetToken(resetPasswordDto.resetToken)
        const foundUser = await this.authService.findOneUserEmail(foundPasswordReset.email);

        if (!foundUser) {
            throw new NotFoundException('User not found');
        }

        const hashedPassword = await bcrypt.hash(resetPasswordDto.password, await bcrypt.genSalt());

        await this.authService.update(foundUser.userId, { password: hashedPassword });

        return {
            message: 'success'
        };
    }
}