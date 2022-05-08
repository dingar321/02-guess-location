import { BadRequestException, Body, Controller, Param, Post, Req, UnauthorizedException, UseInterceptors } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthService } from "src/authentication/auth.service";
import { GuessAddDecorator } from "src/utils/decorators/guess-add.decorator";
import { LocationService } from "../locations/location.service";
import { GuessAddDto } from "./dto/guess-add.dto";
import { Guess } from "./entities/guess.entity";
import { GuessService } from "./guess.service";

@ApiTags('guess')
@Controller()
export class GuessController {
    constructor(private guessService: GuessService, private jwtService: JwtService, private locationService: LocationService, private authService: AuthService) { }

    @ApiOperation({ summary: 'Add a new guess for a specific location' })
    @Post('/guess/:id/add')
    @ApiConsumes('multipart/form-data')
    @GuessAddDecorator()
    @UseInterceptors(FileInterceptor('id'))
    async guessAdd(@Body() guessAddDto: GuessAddDto, @Param('id') id: number, @Req() request: Request): Promise<Guess> {

        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException('You must be signed in to access this function');
            }

            //Now check if the user has already guessed on this location/post
            //To do that first we need the location and the user
            const foundUser = await this.authService.findOneUserId(data.id)
            const foundLocation = await this.locationService.findOne(id)

            var guessed = false;

            const userGuesses = foundUser.guesses;

            //Then we must check if the user has already upvoted this specific quote!
            userGuesses.forEach(element => {
                if (element === id) {
                    guessed = true;
                }
            });

            if (guessed) {
                throw new BadRequestException('You have already guessed on this location')
            }

            await this.authService.userGuessed(foundUser, foundUser.userId, id);

            //Calculating the error distance:
            const errorDistance = await this.haversineDistance(
                foundLocation.longitude, foundLocation.latitude, guessAddDto.longitude, guessAddDto.latitude);

            return await this.guessService.create(guessAddDto, foundLocation, errorDistance);

        } catch (e) {
            throw new UnauthorizedException(e);
        }
    }



    haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        function toRad(x) {
            return x * Math.PI / 180;
        }

        var lon1 = lon1;
        var lat1 = lat1;

        var lon2 = lon2;
        var lat2 = lat2;

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

        return d;
    }
}