import { BadRequestException, Body, Controller, Post, Put, Req, UnauthorizedException, UploadedFile, UseInterceptors } from "@nestjs/common";
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
    @Put('user/change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() request: Request): Promise<any> {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException('You must be logged in to access this function');
            }

            const foundUser = await this.authService.findOneUserId(data.id)

            //Check if the current typed password is correct as the one saved in the database dor the user 
            const isMatchCurrent = await bcrypt.compare(changePasswordDto.passwordCurrent, foundUser.password);
            if (!isMatchCurrent) {
                throw new BadRequestException('Password is incorrect, please try again')
            }

            const isMatchNew = await bcrypt.compare(changePasswordDto.password, foundUser.password);
            //Checks if new and old password are the same
            if (isMatchNew) {
                throw new BadRequestException('New password cannot be the same as the old password ')
            }

            await this.userService.updatePassword(changePasswordDto, foundUser);

            return {
                message: 'Password changed successfully'
            };
        }
        catch (e) {
            throw new UnauthorizedException(e.message);
        }
    }

    @ApiOperation({ summary: 'Change the logged in users information' })
    @Put('user/change-information')
    async changeInformation(@Body() changeInformationDto: ChangeInformationDto, @Req() request: Request): Promise<any> {
        try {
            try {
                const cookie = request.cookies['jwt'];
                const data = await this.jwtService.verifyAsync(cookie);

                if (!data) {
                    throw new UnauthorizedException('You must be logged in to access this function');
                }

                const foundUser = await this.authService.findOneUserId(data.id)

                await this.userService.updateInformation(changeInformationDto, foundUser);

                return {
                    message: 'Information changed successfully'
                };
            }
            catch {
                throw new UnauthorizedException('You must be logged in to access this function');
            }
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    @ApiOperation({ summary: 'Change the logged in user profile image' })
    @ApiConsumes('multipart/form-data')
    @UploadImage()
    @UseInterceptors(FileInterceptor('profileImage'))
    @Put('user/change-profile-image')
    async changeProfileImage(@UploadedFile() profileImage: Express.Multer.File, @Req() request: Request): Promise<any> {
        try {
            try {
                const cookie = request.cookies['jwt'];
                const data = await this.jwtService.verifyAsync(cookie);

                if (!data) {
                    throw new UnauthorizedException('You must be logged in to access this function');
                }

                const foundUser = await this.authService.findOneUserId(data.id)

                await this.userService.updateProfileImage(profileImage, foundUser);

                return {
                    message: 'Profile image changed successfully'
                };
            }
            catch {
                throw new UnauthorizedException('You must be logged in to access this function');
            }
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }
}