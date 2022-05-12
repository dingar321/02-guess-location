import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AuthService } from "src/authentication/auth.service";
import { GuessAddDecorator } from "src/common/decorators/guess-add.decorator";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { LocationService } from "../locations/location.service";
import { GuessAddDto } from "./dto/guess-add.dto";
import { Guess } from "./entities/guess.entity";
import { GuessService } from "./guess.service";

@ApiTags('guess')
@Controller()
export class GuessController {
    constructor(private guessService: GuessService,) { }

    //#region ENDPOINT: guess/add/:locationId 
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Add a new guess for a specific location (Protected)' })
    @ApiCreatedResponse({ description: 'Guess has been successfully added' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @ApiConsumes('multipart/form-data')
    @GuessAddDecorator()
    @UseInterceptors(FileInterceptor('locationId'))
    @Post('guess/add/:locationId')
    async guessAdd(@Body() guessAddDto: GuessAddDto, @Param('locationId') locationId: number, @Req() request): Promise<Guess> {
        return await this.guessService.create(guessAddDto, request, locationId);
    }
    //#endregion

    //#region ENDPOINT: guess/for-user
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get the logged users guesses order by best (smallest error distance) (Protected)' })
    @ApiOkResponse({ description: 'Users guesses have been successfully returned' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @Get('guess/for-user')
    async guessesUsers(@Query('limit') limit: number, @Req() request): Promise<Guess[]> {
        return this.guessService.findAllForUsers(request, limit);
    }
    //#endregion

    //#region ENDPOINT: guess/for-location
    @ApiOperation({ summary: 'Get the locations guesses order by best (smallest error distance)' })
    @ApiOkResponse({ description: 'Locations guesses have been successfully returned' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @ApiQuery({ name: "locationId", type: String, description: "Specify which Location (Required)", required: true })
    @Get('guess/for-location')
    async guessesLocation(@Query() locationId: number, limit: number): Promise<Guess[]> {
        return await this.guessService.fingAllForLocation(locationId, limit);
    }
    //#endregion

}