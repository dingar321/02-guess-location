import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { S3BucketService } from "src/common/s3-bucket/s3-bucket.service";
import { Repository } from "typeorm";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from 'bcrypt';
import { ChangeInformationDto } from "./dto/change-information.dto";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private s3BucketService: S3BucketService) { }

    //change password of the logged user
    async updatePassword(changePasswordDto: ChangePasswordDto, foundUser: User): Promise<User> {
        foundUser.password = await bcrypt.hash(changePasswordDto.password, await bcrypt.genSalt());
        return this.userRepository.save(foundUser);
    }

    //Change information for the logged user
    async updateInformation(changeInformationDto: ChangeInformationDto, foundUser: User): Promise<User> {
        //Check if user already exists with this email and/or if the user set the email to the same already registered one
        if (foundUser.email !== changeInformationDto.email) {
            if ((await this.userRepository.findOne({ email: changeInformationDto.email }))) {
                throw new ConflictException('User with this email already exist');
            }
        }

        foundUser.email = changeInformationDto.email;
        foundUser.firstName = changeInformationDto.firstName;
        foundUser.lastName = changeInformationDto.lastName;

        return this.userRepository.save(foundUser);
    }

    //Change profile image for the logged user
    async updateProfileImage(profileImage: Express.Multer.File, foundUser: User): Promise<User> {

        console.log(foundUser.s3Imagekey);
        //Delete the current image form the AWS S3 bucket 
        await this.s3BucketService.deleteImage(foundUser.s3Imagekey);

        //Uploade the new image to the AWS S3 bucket and replace the value in the database
        const s3Data = await this.s3BucketService.uploadImage(profileImage, 'profile-images');
        foundUser.s3Imagekey = s3Data.key;

        return this.userRepository.save(foundUser);
    }

}