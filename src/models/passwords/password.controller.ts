import { MailerService } from "@nestjs-modules/mailer";
import { BadRequestException, Body, Controller, NotFoundException, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { PasswordService } from "./password.service";
import * as bcrypt from 'bcrypt';
import { AuthService } from "src/authentication/auth.service";
import { ChangePasswordDto } from "../users/dto/change-password.dto";
import e, { Request, Response } from 'express';
import { JwtService } from "@nestjs/jwt";
import { Converter } from "aws-sdk/clients/dynamodb";
import { Timestamp } from "typeorm";

// https://supertokens.com/blog/implementing-a-forgot-password-flow
/*
    When the user submits their emial for the email change we first check if the email exists.
    - If the email exists or not we always send the same message "Email has been sent sucesfully" ( That way we don't give attackers any indication that they should try a different email address.)
    - If the email does exist in the database, then we:
            - create a new password reset token (64 character) string
            - store its hashed version in the database 
            - generate a password reset link that's sent to the user's email address.
    - When the user clicks the link to chagne their password their are redirected to a site with a form where they type thier new password
        - The password validators should follow the same rules as that in a sign up form.
 */

@ApiTags('password')
@Controller()
export class PasswordController {
    constructor(private passwordService: PasswordService, private mailerService: MailerService, private authService: AuthService,) { }

    @ApiOperation({ summary: 'Get token for a forgotten password' })
    @Post('user/forgot-password')
    async forgot(@Body() forgotPasswordDto: ForgotPasswordDto) {
        try {
            const foundUser = await this.authService.findOneUserEmail(forgotPasswordDto.email);
            //Check if he the user exists
            if (!foundUser) {
                return {
                    message: 'Email has been sent sucesfully'
                };
            } else {
                //This else will trigger only if the email exists in the database
                const resetToken = await this.generateToken(64);
                const expirationDate = this.dateTimeNow();
                await this.passwordService.create(forgotPasswordDto, await this.tokenHashSHA256(resetToken), expirationDate);

                //Send an email
                const url = `http://localhost:3000/reset-password?token=${resetToken}`;

                await this.mailerService.sendMail({
                    to: forgotPasswordDto.email,
                    subject: 'Forgotten password, reset your password',
                    html: `Click <a href="${url}">here<a> to reset your password. This link will expire in ${expirationDate}` //Get the time
                });

                return {
                    message: 'Email has been sent sucesfully'
                };
            }
        }
        catch (e) {
            throw new BadRequestException(e.message);
        }

    }

    @ApiOperation({ summary: 'Use the token to change the forgotten password' })
    @Post('user/reset-password')
    async reset(@Body() resetPasswordDto: ResetPasswordDto) {
        try {
            const foundToken = await this.passwordService.findOneResetToken(await this.tokenHashSHA256(resetPasswordDto.resetToken))

            //Check if the token exists (we need to hash it so it can match the original one)
            if (!foundToken) {
                throw new UnauthorizedException("Token is invalid");
            } else {
                //then we need to check if the token has expired
                var timeNow = new Date().valueOf()

                if (timeNow < foundToken.tokenExpiration.valueOf()) {
                    const foundUser = await this.authService.findOneUserEmail(foundToken.email);
                    if (!foundUser) {
                        throw new BadRequestException('Token is invalid');
                    }

                    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, await bcrypt.genSalt());

                    await this.authService.update(foundUser.userId, { password: hashedPassword });

                    return {
                        message: 'Account password has been changed successfully'
                    };
                } else {
                    throw new BadRequestException('Token is invalid');
                }
            }
        }
        catch (e) {
            throw new BadRequestException(e.message);
        }

    }


    generateToken(length) {
        //Generates a token of specified length and hashes it 
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    async tokenHashSHA256(resetToken) {
        var crypto = require('crypto');
        return await crypto.createHash('sha256').update(resetToken).digest('base64')
    }

    dateTimeNow() {
        //Time of reset token creation
        //Plus make the token only available for 2h
        var myDate = new Date();
        myDate.setHours(myDate.getHours() + 2);
        return myDate;
    }



}