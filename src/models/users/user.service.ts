import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { S3BucketService } from "src/common/s3-bucket/s3-bucket.service";
import { Repository } from "typeorm";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { User } from "./entities/user.entity";
import * as bcrypt from 'bcrypt';
import { ChangeInformationDto } from "./dto/change-information.dto";
import { AuthService } from "src/authentication/auth.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
    logger: any;
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private s3BucketService: S3BucketService, private jwtService: JwtService) {
        this.logger = require('node-color-log');
    }

    //#region Change authenticated users password
    async updatePassword(changePasswordDto: ChangePasswordDto, request: any): Promise<User> {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.userRepository.findOne({ userId: data.id });

        //Check if the current typed password is correct as the one saved in the database dor the user 
        const isMatchCurrent = await bcrypt.compare(changePasswordDto.passwordCurrent, foundUser.password);
        if (!isMatchCurrent) {
            this.logger.color('red').error("Password is incorrect, please try again");
            throw new BadRequestException('Password is incorrect, please try again')
        }

        const isMatchNew = await bcrypt.compare(changePasswordDto.password, foundUser.password);
        //Checks if new and old password are the same
        if (isMatchNew) {
            this.logger.color('red').error("New password cannot be the same as the old password");
            throw new BadRequestException('New password cannot be the same as the old password')
        }

        foundUser.password = await bcrypt.hash(changePasswordDto.password, await bcrypt.genSalt());
        //Remove password before returning user
        const { password, ...result } = foundUser;
        this.logger.color('blue').success("Password changed for user: " + foundUser.email + " successful");
        return this.userRepository.save(result);
    }
    //#endregion

    //#region Change authenticated users information
    async updateInformation(changeInformationDto: ChangeInformationDto, request: any): Promise<User> {

        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.userRepository.findOne({ userId: data.id });

        //Check if user already exists with this email and/or if the user set the email to the same already registered one
        if (foundUser.email !== changeInformationDto.email) {
            if ((await this.userRepository.findOne({ email: changeInformationDto.email }))) {
                this.logger.color('red').error("User with this email: " + foundUser.email + " already exist");
                throw new ConflictException('User with this email already exist');
            }
        }

        foundUser.email = changeInformationDto.email;
        foundUser.firstName = changeInformationDto.firstName;
        foundUser.lastName = changeInformationDto.lastName;

        //Remove password before returning user
        const { password, ...result } = foundUser;

        this.logger.color('blue').success("Information changed for user: " + foundUser.email + " successful");
        return this.userRepository.save(result);
    }
    //#endregion

    //#region Change authenticated users profile picture
    async updateProfileImage(profileImage: Express.Multer.File, request: any): Promise<User> {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.userRepository.findOne({ userId: data.id });

        //Delete the current image form the AWS S3 bucket 
        await this.s3BucketService.deleteImage(foundUser.s3Imagekey);

        //Uploade the new image to the AWS S3 bucket and replace the value in the database
        const s3Data = await this.s3BucketService.uploadImage(profileImage, foundUser.userId, 'userId', foundUser.userId);
        foundUser.s3Imagekey = s3Data.key;

        //Remove password before returning user
        const { password, ...result } = foundUser;

        this.logger.color('blue').success("Profile picture changed for user: " + foundUser.email + " successful");
        return this.userRepository.save(result);
    }
    //#endregion
}