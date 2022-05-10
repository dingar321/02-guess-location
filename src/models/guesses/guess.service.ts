import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Location } from "../locations/entities/location.entity";
import { User } from "../users/entities/user.entity";
import { GuessAddDto } from "./dto/guess-add.dto";
import { Guess } from "./entities/guess.entity";

@Injectable()
export class GuessService {
    constructor(@InjectRepository(Guess) private readonly guessRepository: Repository<Guess>) { }

    async create(guessAddDto: GuessAddDto, foundUser: User, foundLocation: Location, errorDistance: number): Promise<Guess> {
        //Time of posting
        var moment = require('moment')
        var timePosted = moment().format('YYYY-MM-DD HH:mm:ss')

        const createdGuess = await this.guessRepository.create({
            latitude: guessAddDto.latitude,
            longitude: guessAddDto.longitude,
            errorDistanceKm: errorDistance,
            timePosted: timePosted,
            locationTk: foundLocation,
            userTk: foundUser
        });

        //Return creted guess
        return await this.guessRepository.save(createdGuess);
    }

    async findAllForUsers(userId: number, limit: number): Promise<Guess[]> {
        const usersGuesses = await this.guessRepository.find({
            where: {
                userTk: userId
            },
            take: limit,
            order: {
                errorDistanceKm: 'ASC'
            },
            relations: ['userTk', 'locationTk'],
        });

        return usersGuesses;
    }

    async fingAllForLocation(locationId: number, limit: number): Promise<Guess[]> {
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

        return locationsGuesses;
    }


}