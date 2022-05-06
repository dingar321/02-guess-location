import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/models/users/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller()
export class AuthController {
    constructor(
        private authService: AuthService,
        private jwtService: JwtService
    ) { }

    @Post('auth/signup')
    async signup(@Body() signUpDto: SignUpDto): Promise<User> {
        return this.authService.create(signUpDto);
    }

    @Post('auth/signin')
    async signin(@Body() signInDto: SignInDto,
        @Res({ passthrough: true }) response: Response): Promise<any> {
        const foundUser = await this.authService.findOneEmail(signInDto.email);

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
            message: 'success'
        };
    }

    @Post('auth/user')
    async user(@Req() request: Request) {


        try {
            const cookie = request.cookies['jwt'];

            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException();
            }

            const foundUser = await this.authService.findOneId(data.id)
            const { password, ...result } = foundUser;

            return result;

        } catch (e) {
            throw new UnauthorizedException();
        }

    }
}



