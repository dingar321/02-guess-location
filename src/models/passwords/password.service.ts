import { MailerService } from "@nestjs-modules/mailer";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "src/authentication/auth.service";
import { Repository } from "typeorm";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { Password } from "./entities/password.entity";
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from "./dto/reset-password.dto";

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

@Injectable()
export class PasswordService {
    logger: any;
    constructor(@InjectRepository(Password) private readonly passwordRepository: Repository<Password>, private mailerService: MailerService, private authService: AuthService,) {
        this.logger = require('node-color-log');
    }

    //#region Create forgot passwor object
    async create(forgotPasswordDto: ForgotPasswordDto) {

        //Check if usr exists
        const foundUser = await this.authService.findOneUserEmail(forgotPasswordDto.email);
        if (!foundUser) {
            this.logger.color('yellow').success("User: " + forgotPasswordDto.email + " doesnt exist, but still responded accordingly");
            return {
                message: 'Email has been successfully sent to the user'
            };
        }

        //This else will trigger only if the email exists in the database
        const resetToken = await this.generateToken(64);
        const expirationDate = this.dateTimeNow();
        const hashedToken = await this.tokenHashSHA256(resetToken);

        //Send an email
        const url = `http://localhost:3000/reset-password?token=${resetToken}`;
        await this.mailerService.sendMail({
            to: forgotPasswordDto.email,
            subject: 'Forgotten password, reset your password',
            html: `Click <a href="${url}">here<a> to reset your password. This link will expire in ${expirationDate}` //Get the time
        });

        //Create object and save it to the database
        return this.passwordRepository.save({
            email: forgotPasswordDto.email,
            resetToken: hashedToken,
            tokenExpiration: expirationDate
        })
    }
    //#endregion

    //#region Get specific reset token object
    async resetPassword(resetPasswordDto: ResetPasswordDto) {

        //Check if the token exists (we need to hash it so it can match the original one)
        const hashedToken = await this.tokenHashSHA256(resetPasswordDto.resetToken);
        const foundToken = await this.passwordRepository.findOne({ resetToken: hashedToken });
        if (!foundToken) {
            this.logger.color('red').error("Provided token is invalid and doesnt exist");
            throw new UnauthorizedException("Token is invalid");
        }

        //We need to check if the token has expired
        var timeNow = new Date().valueOf()
        if (timeNow > foundToken.tokenExpiration.valueOf()) {
            this.logger.color('red').error("Provided token has expired")
            throw new BadRequestException('Token is invalid');
        }

        //Get the user that we want to change the password
        const foundUser = await this.authService.findOneUserEmail(foundToken.email);
        //Hash the new password
        const hashedPassword = await bcrypt.hash(resetPasswordDto.password, await bcrypt.genSalt());

        this.logger.color('blue').success("Password has been successfully changed for user: " + foundToken.email);
        return await this.authService.update(foundUser.userId, { password: hashedPassword });
    }
    //#endregion

    //#region Helper methods
    dateTimeNow() {
        //Time of reset token creation
        //Plus make the token only available for 2h
        var myDate = new Date();
        myDate.setHours(myDate.getHours() + 2);
        return myDate;
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
    //#endregion

}