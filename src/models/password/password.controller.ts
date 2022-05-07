import { MailerService } from "@nestjs-modules/mailer";
import { Body, Controller, NotFoundException, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { PasswordService } from "./password.service";
import * as bcrypt from 'bcrypt';

@ApiTags('password')
@Controller()
export class PasswordController {
    constructor(
        private passwordService: PasswordService,
        private mailerService: MailerService,
    ) { }

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

    @Post('user/reset-password')
    async reset(@Body() resetPasswordDto: ResetPasswordDto) {

        const foundPasswordReset = await this.passwordService.findOneResetToken(resetPasswordDto.resetToken)
        const foundUser = await this.passwordService.findOneUserEmail(foundPasswordReset.email);

        if (!foundUser) {
            throw new NotFoundException('User not found');
        }

        const hashedPassword = await bcrypt.hash(resetPasswordDto.password, await bcrypt.genSalt());

        await this.passwordService.update(foundUser.userId, { password: hashedPassword });

        return {
            message: 'success'
        };
    }
}