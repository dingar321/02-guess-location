import { BadRequestException, Body, Controller, Post, Put, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
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
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";

@ApiTags('user')
@Controller()
export class UserController {
    constructor(private jwtService: JwtService, private authService: AuthService, private userService: UserService) { }

    //#region ENDPOINT: user/change-password
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Change the logged in users password (Protected)', description: `
        Change password schema:
        {
            passwordCurrent*        string
            password*               string
            passwordConfirm*        string
        }
    `})
    @ApiOkResponse({ description: 'User has successfully changed their password' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @Put('user/change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() request): Promise<any> {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id);

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
    //#endregion

    //#region ENDPOINT: user/change-information
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Change the logged in users information (Protected)', description: `
        Change informaton schema:
        {
            email*          string
            firstName*      string
            lastName*       string
        }
    `})
    @ApiOkResponse({ description: 'User has successfully changed their information' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @Put('user/change-information')
    async changeInformation(@Body() changeInformationDto: ChangeInformationDto, @Req() request): Promise<any> {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id);

        await this.userService.updateInformation(changeInformationDto, foundUser);

        return {
            message: 'Information changed successfully'
        };

    }
    //#endregion

    //#region ENDPOINT: user/change-profile-image
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Change the logged in user profile image (Protected)', description: `
        Change profile picture schema:
        {
            profileImage*      string($binary)
        }
    `})
    @ApiOkResponse({ description: 'User has successfully changed their profile picture  ' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @ApiConsumes('multipart/form-data')
    @UploadImage()
    @UseInterceptors(FileInterceptor('profileImage'))
    @Put('user/change-profile-image')
    async changeProfileImage(@UploadedFile() profileImage: Express.Multer.File, @Req() request): Promise<any> {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id);

        await this.userService.updateProfileImage(profileImage, foundUser);

        return {
            message: 'Profile image changed successfully'
        };
    }
    //#endregion

}