import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { ChangePasswordDto } from "../users/dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { Password } from "./entities/password.entity";

@Injectable()
export class PasswordService {
    constructor(@InjectRepository(Password) private readonly passwordRepository: Repository<Password>) { }

    async create(forgotPasswordDto: ForgotPasswordDto, resetToken: string) {
        return this.passwordRepository.save({
            email: forgotPasswordDto.email,
            resetToken: resetToken
        })
    }

    async findOneResetToken(resetToken: string) {
        return this.passwordRepository.findOne({ resetToken: resetToken })
    }

}