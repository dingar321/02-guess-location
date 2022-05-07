import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { Password } from "./entities/password.entity";

@Injectable()
export class PasswordService {
    constructor(
        @InjectRepository(Password) private readonly passwordRepository: Repository<Password>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) { }

    async create(forgotPasswordDto: ForgotPasswordDto, resetToken: string) {
        return this.passwordRepository.save({
            email: forgotPasswordDto.email,
            resetToken: resetToken
        })
    }

    async findOneResetToken(resetToken: string) {
        return this.passwordRepository.findOne({ resetToken: resetToken })
    }


    //Move
    async findOneUserEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ email: email })
    }

    async update(id: number, data: any): Promise<any> {
        return await this.userRepository.update(id, data);
    }

}