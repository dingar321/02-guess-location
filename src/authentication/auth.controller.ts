import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { User } from 'src/models/users/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';


@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('auth/signup')
    async signup(@Body() signUpDto: SignUpDto): Promise<User> {
        return this.authService.create(signUpDto);
    }

    @Post('auth/signin')
    async signin(@Body() signInDto: SignInDto) {
        return this.authService.findOne(signInDto, null);
    }

    @Get('auth/user')
    async user() {
        return this.authService.findUser(null);
    }

    @Post('auth/logout')
    async logout() {
        return this.authService.findUser(null);
    }
}



