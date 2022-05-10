import { Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException, UploadedFile, UseInterceptors } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { LocationAddDecorator } from "src/common/decorators/location-add.decorator";
import { LocationAddDto } from "./dto/location-add.dto";
import { LocationService } from "./location.service";
import { Request } from 'express';
import { AuthService } from "src/authentication/auth.service";
import { Location } from "./entities/location.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";


@ApiTags('location')
@Controller()
export class LocationController {
    constructor(private locationService: LocationService, private jwtService: JwtService, private authService: AuthService) { }

    @ApiOperation({ summary: 'Add a new location' })
    @ApiConsumes('multipart/form-data')
    @LocationAddDecorator()
    @UseInterceptors(FileInterceptor('locationImage'))
    @Post('location/add')
    async locationAdd(@Body() locationAddDto: LocationAddDto, @UploadedFile() locationImage: Express.Multer.File, @Req() request: Request): Promise<Location> {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException('You must be signed in to access this function');
            }

            //Getting the user that is adding  
            const foundUser = await this.authService.findOneUserId(data.id)
            return await this.locationService.create(locationAddDto, locationImage, foundUser);

        } catch (e) {
            throw new UnauthorizedException('You must be signed in to access this function');
        }
    }

    @ApiOperation({ summary: 'Get random location/post' })
    @Get('location/random')
    async locationRandom(): Promise<Location> {
        return await this.locationService.findRandom();
    }


    @ApiOperation({ summary: 'Get all locations/posts (Pagination)' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @Get('location/list')
    async locations(@Query('limit') limit?: number): Promise<Location[]> {
        return await this.locationService.findAll(limit);
    }

    @ApiOperation({ summary: 'Get the logged users posted locations' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @Get('/location/user-posted')
    async locationsUserPosted(@Query('limit') limit: number, @Req() request: Request) {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException('You must be signed in to access this function');
            }

            //Getting the user, the on who wants his guesses  
            const foundUser = await this.authService.findOneUserId(data.id)

            return this.locationService.findAllUsersLocations(foundUser.userId, limit);

        } catch (e) {
            throw new UnauthorizedException(e.message);
        }
    }



}