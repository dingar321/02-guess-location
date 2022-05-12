import { ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/models/users/entities/user.entity";
import { Repository } from "typeorm";
import { SignUpDto } from "./dto/sign-up.dto";
import * as bcrypt from 'bcrypt';
import { S3BucketService } from "src/common/s3-bucket/s3-bucket.service";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthService {
    logger: any;
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private jwtService: JwtService, private s3BucketService: S3BucketService) {
        this.logger = require('node-color-log');
    }

    //#region Create user
    async create(signUpDto: SignUpDto, profileImage: Express.Multer.File) {
        //Check if user already exists with this email
        if ((await this.userRepository.findOne({ email: signUpDto.email }))) {
            this.logger.color('red').error("User with this email already exist")
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

        //Remove password before returning user
        const { password, ...result } = foundUser;

        //Return creted user and log
        this.logger.color('blue').success("User " + signUpDto.email + " Signed up")
        return {
            message: 'successfully signed up'
        };
    }
    //#endregion

    //#region User login
    async signin(signInDto: SignInDto, response: any) {
        const foundUser = await this.userRepository.findOne({ email: signInDto.email });
        //Check if he the user exists
        if (!foundUser) {
            this.logger.color('red').error("Credentials invalid, wrong email")
            throw new UnauthorizedException("Credentials invalid");
        }

        //Compare passwords if they match
        if (!await bcrypt.compare(signInDto.password, foundUser.password)) {
            this.logger.color('red').error("Credentials invalid, wrong password")
            throw new UnauthorizedException("Credentials invalid");
        }

        //Create a JWT HttpOnly cookie 
        const jwt = await this.jwtService.signAsync({ id: foundUser.userId });
        response.cookie('jwt', jwt, { httpOnly: true });

        this.logger.color('blue').success("User " + signInDto.email + " signed in")
        return {
            message: 'successfully signed in'
        };
    }
    //#endregion

    //#region Get user with cookie
    async findUser(request: any) {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.userRepository.findOne({ userId: data.id })

        //Remove password before returning user
        const { password, ...result } = foundUser;

        this.logger.color('blue').success("User " + foundUser.email + " found")
        return result;
    }
    //#endregion

    //#region User logout
    async logout(response: any) {
        response.clearCookie('jwt');
        this.logger.color('blue').success("User successfully logged out")
        return {
            message: 'successfully logged out'
        };
    }
    //#endregion


    //Move these bottom ones

    //#region Get user by email
    async findOneUserEmail(email: string) {

        return await this.userRepository.findOne({ email: email })
    }
    //#endregion

    //#region Get user by id
    async findOneUserId(id: number) {
        return await this.userRepository.findOne({ userId: id })
    }
    //#endregion

    //#region Update users password with the reset token
    async update(id: number, data: any) {
        return await this.userRepository.update(id, data);
    }
    //#endregion

    //#region Record for the location
    //(Cannot guess on a location twice)
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
    //#endregion


    dateTimeNow() {
        //Time of registration
        var moment = require('moment');
        var timeRegistered = moment().format('YYYY-MM-DD HH:mm:ss');
        return timeRegistered;
    }
}