import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/models/users/entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "./dto/sign-up.dto";
import * as bcrypt from 'bcrypt';
import { S3BucketService } from "src/common/s3-bucket/s3-bucket.service";


@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private s3BucketService: S3BucketService) { }

    async create(signUpDto: SignUpDto, profileImage: Express.Multer.File): Promise<User> {
        //Check if user already exists with this email
        if ((await this.userRepository.findOne({ email: signUpDto.email }))) {
            throw new ConflictException('User with this email already exist');
        }

        //hashing the password 
        const hashedPassword = await bcrypt.hash(signUpDto.password, await bcrypt.genSalt());

        //Creating the user with all of the properties
        const createdUser = await this.userRepository.create({
            email: signUpDto.email,
            firstName: signUpDto.firstName,
            lastName: signUpDto.lastName,
            password: hashedPassword,
            timeRegistered: this.dateTimeNow(),
            s3Imagekey: 'null'
        });
        await this.userRepository.save(createdUser);

        //Getting the just registered user to get his id
        const foundUser = await this.userRepository.findOne({ email: signUpDto.email });
        //Getting the s3 key/data to store in the database
        const s3Data = await this.s3BucketService.uploadImage(profileImage, foundUser.userId, 'userId', foundUser.userId);

        foundUser.s3Imagekey = s3Data.key;

        //Return creted user
        return await this.userRepository.save(foundUser);
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



    dateTimeNow() {
        //Time of registration
        var moment = require('moment');
        var timeRegistered = moment().format('YYYY-MM-DD HH:mm:ss');
        return timeRegistered;
    }
}