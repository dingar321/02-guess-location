import { ConflictException, Get, Injectable, Req, Res, UnauthorizedException } from "@nestjs/common";
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
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    async create(signUpDto: SignUpDto): Promise<User> {
        //Check if user already exists with this email
        if ((await this.userRepository.findOne({ email: signUpDto.email }))) {
            throw new ConflictException('User with this email already exist');
        }
        //Create object and hash the password
        const registeredUser = this.userRepository.create(signUpDto);
        registeredUser.password = await bcrypt.hash(registeredUser.password, await bcrypt.genSalt());

        //Return creted user
        return this.userRepository.save(registeredUser);
    }

    async findOneUserEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ email: email })
    }

    async findOneUserId(id: number): Promise<User> {
        return await this.userRepository.findOne({ userId: id })
    }

}