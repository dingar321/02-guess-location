import { MailerService } from "@nestjs-modules/mailer";
import { BadRequestException, Body, Controller, NotFoundException, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { PasswordService } from "./password.service";

import { AuthService } from "src/authentication/auth.service";
import { ChangePasswordDto } from "../users/dto/change-password.dto";
import e, { Request, Response } from 'express';
import { JwtService } from "@nestjs/jwt";
import { Converter } from "aws-sdk/clients/dynamodb";
import { Timestamp } from "typeorm";

@ApiTags('password')
@Controller()
export class PasswordController {
    constructor(private passwordService: PasswordService, private mailerService: MailerService, private authService: AuthService,) { }

    //#region Send reset password link & generate token
    @ApiOperation({ summary: 'Get token for a forgotten password' })
    @ApiOkResponse({ description: 'Email has been successfully sent to the user' })
    @Post('user/forgot-password')
    async forgot(@Body() forgotPasswordDto: ForgotPasswordDto) {
        await this.passwordService.create(forgotPasswordDto);
        return {
            message: 'Email has been successfully sent to the user'
        };
    }
    //#endregion

    //#region Reset password using link/token
    @ApiOperation({
        summary: 'Use the token to change the forgotten password', description: `
        Reset password schema:
        {
            resetToken*             string
            password*               string
            passwordConfirm*        string
        }
    `})
    @ApiOkResponse({ description: 'User has successfully changed their password using the reset link' })
    @ApiBadRequestResponse({ description: 'Values must be provided in the correct format' })
    @Post('user/reset-password')
    async reset(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.passwordService.resetPassword(resetPasswordDto)
        return {
            message: 'Account password has been changed successfully'
        };
    }
    //#endregion

}