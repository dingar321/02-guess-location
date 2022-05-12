import { Body, Controller, Logger, Post, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from 'src/models/users/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { SignUpDecorator } from 'src/common/decorators/sign-up.decorator';
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';

@ApiTags('auth')
@Controller()
export class AuthController {
    constructor(private authService: AuthService, private jwtService: JwtService) { }

    //#region ENDPOINT: auth/signup
    @ApiOperation({
        summary: 'Creating a new account', description: `
        Sign up schema:
        {
            email*              string
            firstName*          string
            lastName*           string 
            password*           string
            passwordConfirm*    string
            profileImage*       string($binary)
        }
    `})
    @ApiCreatedResponse({ description: 'User has successfully signed up' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @ApiConflictResponse({ description: 'User with that email already exists' })
    @Post('auth/signup')
    @ApiConsumes('multipart/form-data')
    @SignUpDecorator()
    @UseInterceptors(FileInterceptor('profileImage'))
    async signup(@Body() signUpDto: SignUpDto,
        @UploadedFile() profileImage: Express.Multer.File): Promise<User> {

        const createdUser = await this.authService.create(signUpDto, profileImage);

        //Remove password when returning user
        delete createdUser.password;

        return createdUser;
    }
    //#endregion

    //#region ENDPOINT: auth/signin
    @ApiOperation({
        summary: 'login if the user has an existing account', description: `
        Sign in schema:
        {
            email*          string
            password*       string
        }
    `})
    @ApiOkResponse({ description: 'User has successfully signed in' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @Post('auth/signin')
    async signin(@Body() signInDto: SignInDto,
        @Res({ passthrough: true }) response: Response): Promise<any> {
        const foundUser = await this.authService.findOneUserEmail(signInDto.email);
        //Check if he the user exists
        if (!foundUser) {
            throw new UnauthorizedException("Credentials invalid");
        }

        //Compare passwords if they match
        if (!await bcrypt.compare(signInDto.password, foundUser.password)) {
            throw new UnauthorizedException("Credentials invalid");
        }

        const jwt = await this.jwtService.signAsync({ id: foundUser.userId });
        //const jwt = this.jwtService.sign({ sub: foundUser.userId, email: foundUser.email, type: 'user' });

        response.cookie('jwt', jwt, { httpOnly: true });

        return {
            message: 'successfully signed in'
        };
    }
    //#endregion

    //#region ENDPOINT: auth/user
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Getting the logged in user (Protected)', description: `
    ` })
    @ApiOkResponse({ description: 'User has been successfully returned' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @Post('auth/user')
    async user(@Req() request) {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id);

        //Remove password before returning user
        const { password, ...result } = foundUser;

        return result;
    }
    //#endregion

    //#region ENDPOINT: auth/logout
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Logout if user is logged in (Protected)', description: `
    ` })
    @ApiOkResponse({ description: 'User has been successfully logged out' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @Post('auth/logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt');

        return {
            message: 'successfully logged out'
        };
    }
    //#endregion
}



