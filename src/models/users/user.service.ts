import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageUploadeService } from "src/utils/S3Service/image-uploade.service";
import { Repository } from "typeorm";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from 'bcrypt';
import { ChangeInformationDto } from "./dto/change-information.dto";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private imageUploadeService: ImageUploadeService) { }

    async updatePassword(changePasswordDto: ChangePasswordDto, foundUser: User): Promise<User> {
        foundUser.password = await bcrypt.hash(changePasswordDto.password, await bcrypt.genSalt());
        return this.userRepository.save(foundUser);
    }

    async updateInformation(changeInformationDto: ChangeInformationDto, foundUser: User): Promise<User> {

        //Check if user already exists with this email
        if ((await this.userRepository.findOne({ email: changeInformationDto.email }))) {
            throw new ConflictException('User with this email already exist');
        }

        foundUser.email = changeInformationDto.email;
        foundUser.firstName = changeInformationDto.firstName;
        foundUser.lastName = changeInformationDto.lastName;

        return this.userRepository.save(foundUser);

    }

}