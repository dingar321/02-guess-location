import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException, UseInterceptors } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthService } from "src/authentication/auth.service";
import { GuessAddDecorator } from "src/common/decorators/guess-add.decorator";
import { LocationService } from "../locations/location.service";
import { GuessAddDto } from "./dto/guess-add.dto";
import { Guess } from "./entities/guess.entity";
import { GuessService } from "./guess.service";

@ApiTags('guess')
@Controller()
export class GuessController {
    constructor(private guessService: GuessService, private jwtService: JwtService, private locationService: LocationService, private authService: AuthService) { }


    @ApiOperation({ summary: 'Add a new guess for a specific location' })
    @ApiConsumes('multipart/form-data')
    @GuessAddDecorator()
    @UseInterceptors(FileInterceptor('locationId'))
    @Post('/guess/add/:locationId')
    async guessAdd(@Body() guessAddDto: GuessAddDto, @Param('locationId') locationId: number, @Req() request: Request): Promise<Guess> {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException('You must be signed in to access this function');
            }

            //Now check if the user has already guessed on this location/post
            //To do that first we need the location and the user
            const foundUser = await this.authService.findOneUserId(data.id)
            const foundLocation = await this.locationService.findOne(locationId)

            if (foundUser.userId === foundLocation.userTk.userId) {
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
                throw new BadRequestException('You have already guessed on this location')
            }

            //Must rotate the inputs
            await this.authService.userGuessed(foundUser, foundUser.userId, locationId);

            //Calculating the error distance:
            const errorDistance = await this.haversineFormula(
                foundLocation.latitude, foundLocation.longitude,
                guessAddDto.latitude, guessAddDto.longitude
            );

            return await this.guessService.create(guessAddDto, foundUser, foundLocation, errorDistance);

        } catch (e) {
            throw new UnauthorizedException(e.message);
        }
    }

    @ApiOperation({ summary: 'Get the logged users guesses order by best (smallest error distance)' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @Get('/guess/for-user')
    async guessesUsers(@Query('limit') limit: number, @Req() request: Request): Promise<Guess[]> {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException('You must be signed in to access this function');
            }

            //Getting the user, the on who wants his guesses  
            const foundUser = await this.authService.findOneUserId(data.id)

            return this.guessService.findAllForUsers(foundUser.userId, limit);

        } catch (e) {
            throw new UnauthorizedException(e.message);
        }
    }

    @ApiOperation({ summary: 'Get the locations guesses order by best (smallest error distance)' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @ApiQuery({ name: "locationId", type: String, description: "Specify which Location (Required)", required: true })
    @Get('/guess/for-location')
    async guessesLocation(@Query() locationId: number, limit: number): Promise<Guess[]> {
        try {
            return await this.guessService.fingAllForLocation(locationId, limit);

        } catch (e) {
            throw new UnauthorizedException(e.message);
        }
    }



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
}