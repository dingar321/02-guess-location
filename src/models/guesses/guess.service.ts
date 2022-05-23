import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "src/authentication/auth.service";
import { S3BucketService } from "src/common/s3-bucket/s3-bucket.service";
import { Repository } from "typeorm";
import { Location } from "../locations/entities/location.entity";
import { LocationService } from "../locations/location.service";
import { User } from "../users/entities/user.entity";
import { GuessAddDto } from "./dto/guess-add.dto";
import { Guess } from "./entities/guess.entity";

@Injectable()
export class GuessService {
    logger: any;
    constructor(@InjectRepository(Guess) private readonly guessRepository: Repository<Guess>, private s3BucketService: S3BucketService, private locationService: LocationService, private jwtService: JwtService, private authService: AuthService) {
        this.logger = require('node-color-log');
    }

    //#region Create guess 
    async create(guessAddDto: GuessAddDto, request: any, locationId: number): Promise<Guess> {

        //Now check if the user has already guessed on this location/post
        //To do that first we need the location and the user
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id)
        const foundLocation = await this.locationService.findOne(locationId)

        //Cheks if we are trying to guess on our own posted location
        if (foundUser.userId === foundLocation.userTk.userId) {
            this.logger.color('red').error("Cannot add a guess to your own locations")
            throw new BadRequestException('Cannot add a guess to your own locations');
        }

        var guessed = false;
        const userGuesses = foundUser.guesses;

        //Then we must check if the user has already upvoted this specific quote!
        userGuesses.forEach(element => {
            if (element === locationId) {
                guessed = true;
            }
        });

        if (guessed) {
            this.logger.color('red').error("You have already guessed on this location")
            throw new BadRequestException('You have already guessed on this location')
        }

        //Store the location id to the users array of guesses  
        await this.authService.userGuessed(foundUser, foundUser.userId, locationId);

        //Calculating the error distance:
        const errorDistance = await this.haversineFormula(
            foundLocation.latitude, foundLocation.longitude,
            guessAddDto.latitude, guessAddDto.longitude
        );

        //Time of posting
        var moment = require('moment')
        var timePosted = moment().format('YYYY-MM-DD HH:mm:ss')

        const createdGuess = await this.guessRepository.create({
            errorDistanceKm: errorDistance,
            timePosted: timePosted,
            locationTk: foundLocation,
            userTk: foundUser
        });

        //Return creted guess and log response
        this.logger.color('blue').success("Guess by: " + foundUser.email + " has been added to location: " + foundLocation.locationId);
        return await this.guessRepository.save(createdGuess);
    }
    //#endregion

    //#region Get all guesses for user (Sort: errorDistance best first)
    async findAllForUsers(request: any, limit: number): Promise<Guess[]> {
        //Getting the user, the on who wants his guesses  
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id)

        const usersGuesses = await this.guessRepository.find({
            where: {
                userTk: foundUser.userId
            },
            take: limit,
            order: {
                errorDistanceKm: 'ASC'
            },
            relations: ['userTk', 'locationTk'],
        });

        usersGuesses.forEach(element => {
            delete element.userTk.password
        });

        //Replace image keys with actuall link to the image
        for (const guess of usersGuesses) {
            guess.locationTk.s3Imagekey = await this.s3BucketService.getImage(guess.locationTk.s3Imagekey);
        }

        this.logger.color('blue').success("All guesses of user: " + foundUser.userId + " returned");
        return usersGuesses;
    }
    //#endregion

    //#region Get all guesses for location (Sort: errorDistance best first)
    async findAllForLocation(locationId: number, limit: number): Promise<Guess[]> {
        const locationsGuesses = await this.guessRepository.find({
            relations: ['userTk', 'locationTk'],
            where: {
                locationTk: locationId
            },
            take: limit,
            order: {
                errorDistanceKm: 'ASC'
            },

        });

        locationsGuesses.forEach(element => {
            delete element.userTk.password
        });

        //Replace image keys with actuall link to the image
        for (const guess of locationsGuesses) {
            guess.locationTk.s3Imagekey = await this.s3BucketService.getImage(guess.locationTk.s3Imagekey);
            guess.userTk.s3Imagekey = await this.s3BucketService.getImage(guess.userTk.s3Imagekey);
        }

        this.logger.color('blue').success("All guesses of location: " + locationId + " returned");
        return locationsGuesses;
    }
    //#endregion


    //#region Find the specific guess for location b logged user 
    async findUsersGuess(locationId: number, request: any) {
        //Now check if the user has already guessed on this location/post
        //To do that first we need the location and the user
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id)

        //const foundGuess = await this.findAllForLocation(locationId, null);

        const foundGuess = await this.guessRepository.findOne({
            where: {
                locationTk: locationId,
                userTk: foundUser.userId
            },
            relations: ['userTk', 'locationTk'],
        })


        //Replace image keys with actuall link to the image
        foundGuess.locationTk.s3Imagekey = await this.s3BucketService.getImage(foundGuess.locationTk.s3Imagekey);
        foundGuess.userTk.s3Imagekey = await this.s3BucketService.getImage(foundGuess.userTk.s3Imagekey);

        delete foundGuess.userTk.password

        return foundGuess;
    }
    //#endregion


    //#region haversineFormula
    haversineFormula(lat1: number, lon1: number, lat2: number, lon2: number) {
        function toRad(x) {
            return x * Math.PI / 180;
        }

        //First set of coordinates
        var lat1 = lat1;
        var lon1 = lon1;

        //Second set of coordinates
        var lat2 = lat2;
        var lon2 = lon2;

        //The earths radius 
        var R = 6371; // km

        var x1 = lat2 - lat1;
        var dLat = toRad(x1);
        var x2 = lon2 - lon1;
        var dLon = toRad(x2)
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;

        //We also remove all of the decimals
        return d >> 0;
    }
    //#endregion
}