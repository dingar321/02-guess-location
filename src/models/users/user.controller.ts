import { BadRequestException, Body, Controller, Post, Req, UnauthorizedException, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { Request, Response } from 'express';
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/authentication/auth.service";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { ChangeInformationDto } from "./dto/change-information.dto";
import * as bcrypt from 'bcrypt';
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadImage } from "src/common/decorators/upload-image.decorator";
import { profile } from "console";

@ApiTags('user')
@Controller()
export class UserController {
    constructor(private jwtService: JwtService, private authService: AuthService, private userService: UserService) { }

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

            const isMatch = await bcrypt.compare(changePasswordDto.password, foundUser.password);
            //Checks if new and old password are the same
            if (isMatch) {
                throw new BadRequestException('New password cannot be the same as the old password ')
            }

            await this.userService.updatePassword(changePasswordDto, foundUser);

            return {
                message: 'password changed'
            };

        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    @ApiOperation({ summary: 'Change the logged in users information' })
    @Post('user/change-information')
    async changeInformation(@Body() changeInformationDto: ChangeInformationDto, @Req() request: Request): Promise<any> {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException();
            }

            const foundUser = await this.authService.findOneUserId(data.id)

            await this.userService.updateInformation(changeInformationDto, foundUser);

            return {
                message: 'information changed'
            };

        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    @ApiOperation({ summary: 'Change the logged in user profile image' })
    @Post('user/change-profile-image')
    @ApiConsumes('multipart/form-data')
    @UploadImage()
    @UseInterceptors(FileInterceptor('profileImage'))
    async changeProfileImage(@UploadedFile() profileImage: Express.Multer.File, @Req() request: Request): Promise<any> {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException();
            }

            const foundUser = await this.authService.findOneUserId(data.id)

            await this.userService.updateProfileImage(profileImage, foundUser);

            return {
                message: 'profile image changed'
            };

        } catch (e) {
            console.log(e.message);
            throw new UnauthorizedException(e.message);
        }
    }
}