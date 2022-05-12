import { Body, Controller, Logger, Post, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
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

    @ApiOperation({ summary: 'Creating a new account' })
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

    @ApiOperation({ summary: 'login if the user has an existing account' })
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

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Getting the logged in user' })
    @Post('auth/user')
    async user(@Req() req) {

        const data = await this.jwtService.verifyAsync(req.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id);

        //Remove password before returning user
        const { password, ...result } = foundUser;

        return result;
    }

    @ApiOperation({ summary: 'Logout if user is logged in' })
    @Post('auth/logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt');

        return {
            message: 'successfully logged out'
        };
    }
}



