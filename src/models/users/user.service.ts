import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageUploadeService } from "src/utils/S3Service/image-uploade.service";
import { Repository } from "typeorm";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private imageUploadeService: ImageUploadeService) { }

    async updatePassword(changePasswordDto: ChangePasswordDto, foundUser: User): Promise<User> {

        const isMatch = await bcrypt.compare(changePasswordDto.password, foundUser.password);
        //Checks if new and old password are the same
        if (isMatch) {
            throw new BadRequestException('New password cannot be the same as the old password ')
        }

        foundUser.password = await bcrypt.hash(changePasswordDto.password, await bcrypt.genSalt());

        return this.userRepository.save(foundUser);

    }

}