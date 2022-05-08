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
            longitude: guessAddDto.longitude,
            latitude: guessAddDto.latitude,
            errorDistance: errorDistance,
            timePosted: timePosted,
            locationTk: foundLocation,
            userTk: foundUser
        });

        //Return creted guess
        return await this.guessRepository.save(createdGuess);
    }


}