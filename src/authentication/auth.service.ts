import { Get, Injectable, Req, Res, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/models/users/entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "./dto/sign-up.dto";
import * as bcrypt from 'bcrypt';
import { SignInDto } from "./dto/sign-in.dto";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private jwtService: JwtService) { }

    async create(signUpDto: SignUpDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(signUpDto.password, 12);

        return this.create({
            email: signUpDto.email,
            firstName: signUpDto.firstName,
            lastName: signUpDto.lastName,
            password: signUpDto.password,
            passwordConfirm: null,
        });
    }

    async findOne(signInDto: SignInDto, @Res({ passthrough: true }) response: Response) {
        const foundUser = await this.userRepository.findOne({ email: signInDto.email });

        //Check if he exists
        if (!foundUser) {
            throw new UnauthorizedException("Credentials invalid");
        }

        if (!await bcrypt.compare(signInDto.password, foundUser.password)) {
            throw new UnauthorizedException("Credentials invalid");
        }

        const jwt = await this.jwtService.signAsync({ id: foundUser.userId });

        response.cookie('jwt', jwt, { httpOnly: true });

        return {
            message: 'success'
        };
    }

    async findUser(@Req() request: Request) {

        try {
            const cookie = request.cookies['jwt'];

            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException();
            }

            const user = await this.userRepository.findOne({ userId: data['id'] });

            //const { password, ...result } = user;

            return user;

        }
        catch (e) {
            throw new UnauthorizedException();
        }

    }

    async logoutUser(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt');

        return {
            message: 'success'
        };
    }
}