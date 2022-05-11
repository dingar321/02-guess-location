import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { Password } from "./entities/password.entity";

@Injectable()
export class PasswordService {
    constructor(@InjectRepository(Password) private readonly passwordRepository: Repository<Password>) { }

    async create(forgotPasswordDto: ForgotPasswordDto, resetToken: string, expirationDate: Date) {
        return this.passwordRepository.save({
            email: forgotPasswordDto.email,
            resetToken: resetToken,
            tokenExpiration: expirationDate
        })
    }

    async findOneResetToken(resetToken: string) {
        return this.passwordRepository.findOne({ resetToken: resetToken })
    }


    dateTimeNow() {
        //Time of reset token creation
        //Plus make the token only available for 2h
        var myDate = new Date();
        myDate.setHours(myDate.getHours() + 2);
        return myDate;
    }

}