import { Body, Controller, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { SignUpDecorator } from 'src/common/decorators/sign-up.decorator';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';

@ApiTags('auth')
@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    //#region ENDPOINT: auth/signup
    @ApiOperation({ summary: 'Creating a new account' })
    @ApiCreatedResponse({ description: 'User has successfully signed up' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @ApiConflictResponse({ description: 'User with that email already exists' })
    @Post('auth/signup')
    @ApiConsumes('multipart/form-data')
    @SignUpDecorator()
    @UseInterceptors(FileInterceptor('profileImage'))
    async signup(@Body() signUpDto: SignUpDto,
        @UploadedFile() profileImage: Express.Multer.File) {
        return await this.authService.create(signUpDto, profileImage);
    }
    //#endregion

    //#region ENDPOINT: auth/signin
    @ApiOperation({ summary: 'login if the user has an existing account' })
    @ApiOkResponse({ description: 'User has successfully signed in' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @Post('auth/signin')
    async signin(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: Response) {
        return await this.authService.signin(signInDto, response);
    }
    //#endregion

    //#region ENDPOINT: auth/user
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Getting the logged in user (Protected)' })
    @ApiOkResponse({ description: 'User has been successfully returned' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @Post('auth/user')
    async user(@Req() request) {
        return await this.authService.findUser(request);
    }
    //#endregion

    //#region ENDPOINT: auth/logout
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Logout if user is logged in (Protected)' })
    @ApiOkResponse({ description: 'User has been successfully logged out' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @Post('auth/logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        return await this.authService.logout(response);
    }
    //#endregion
}



