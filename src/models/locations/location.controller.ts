import { Body, Controller, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LocationAddDecorator } from "src/common/decorators/location-add.decorator";
import { LocationAddDto } from "./dto/location-add.dto";
import { LocationService } from "./location.service";
import { Location } from "./entities/location.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";

@ApiTags('location')
@Controller()
export class LocationController {
    constructor(private locationService: LocationService) { }

    //#region ENDPOINT: location/add
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Add a new location (Protected)' })
    @ApiCreatedResponse({ description: 'Location has been successfully posted' })
    @ApiBadRequestResponse({ description: 'User must provide values in the correct format' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @ApiConsumes('multipart/form-data')
    @LocationAddDecorator()
    @UseInterceptors(FileInterceptor('locationImage'))
    @Post('location/add')
    async locationAdd(@Body() locationAddDto: LocationAddDto, @UploadedFile() locationImage: Express.Multer.File, @Req() request): Promise<Location> {
        return await this.locationService.create(locationAddDto, locationImage, request);
    }
    //#endregion

    //#region ENDPOINT: location/random
    @ApiOperation({ summary: 'Get random location/post' })
    @ApiOkResponse({ description: 'Random location has been successfully returned' })
    @Get('location/random')
    async locationRandom(): Promise<Location> {
        return await this.locationService.findRandom();
    }
    //#endregion

    //#region ENDPOINT: location/list
    @ApiOperation({ summary: 'Get all locations/posts (Pagination)' })
    @ApiOkResponse({ description: 'Locations have been successfully returned' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @Get('location/list')
    async locations(@Query('limit') limit?: number): Promise<Location[]> {
        return await this.locationService.findAll(limit);
    }
    //#endregion

    //#region ENDPOINT: location/user-posted
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get the logged users posted locations (Protected)' })
    @ApiOkResponse({ description: 'Users locations have been successfully returned' })
    @ApiUnauthorizedResponse({ description: 'User must be authenticated to access this function' })
    @ApiQuery({ name: "limit", type: String, description: "A limit parameter (Optional)", required: false })
    @Get('location/user-posted')
    async locationsUserPosted(@Query('limit') limit: number, @Req() request) {
        return this.locationService.findAllUsersLocations(limit, request);
    }
    //#endregion

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a specific location (Protected)' })
    @Get('location/:locationId')
    async specificLocation(@Param('locationId') locationId: number) {
        return this.locationService.findLocation(locationId);
    }

}