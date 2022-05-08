import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/models/users/entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "./dto/sign-up.dto";
import * as bcrypt from 'bcrypt';
import { ImageUploadeService } from "src/utils/S3Service/image-uploade.service";


@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private imageUploadeService: ImageUploadeService) { }

    async create(signUpDto: SignUpDto, profileImage: Express.Multer.File): Promise<User> {
        //Check if user already exists with this email
        if ((await this.userRepository.findOne({ email: signUpDto.email }))) {
            throw new ConflictException('User with this email already exist');
        }

        //Time of registration
        var moment = require('moment')
        var timeRegistered = moment().format('YYYY-MM-DD HH:mm:ss')

        //hashing the password and getting the s3 key/data to store in the database
        const s3Data = await this.imageUploadeService.uploadImage(profileImage);
        const hashedPassword = await bcrypt.hash(signUpDto.password, await bcrypt.genSalt());

        //Creating the user with all of the properties
        const createdUser = await this.userRepository.create({
            email: signUpDto.email,
            firstName: signUpDto.firstName,
            lastName: signUpDto.lastName,
            password: hashedPassword,
            timeRegistered: timeRegistered,
            s3Imagekey: s3Data.key
        });

        //Return creted user
        return await this.userRepository.save(createdUser);
    }

    async findOneUserEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ email: email })
    }

    async findOneUserId(id: number): Promise<User> {
        return await this.userRepository.findOne({ userId: id })
    }

    //Update users password with the reset token
    async update(id: number, data: any): Promise<any> {
        return await this.userRepository.update(id, data);
    }

    //Record for the location, we cannot guess on a location twice
    async userGuessed(user: User, userId: number, locationId: number) {
        const userGuesses = user.guesses;
        userGuesses.push(locationId);

        const foundUser = await this.userRepository.preload({
            //Set the preload info for the user 
            userId: +userId,
            guesses: userGuesses
        });
        await this.userRepository.save(foundUser);
    }


}