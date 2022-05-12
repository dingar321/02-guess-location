import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "src/authentication/auth.service";
import { S3BucketService } from "src/common/s3-bucket/s3-bucket.service";
import { Repository } from "typeorm";
import { LocationAddDto } from "./dto/location-add.dto";
import { Location } from "./entities/location.entity";

@Injectable()
export class LocationService {
    logger: any;
    constructor(@InjectRepository(Location) private readonly locationRepository: Repository<Location>, private s3BucketService: S3BucketService, private jwtService: JwtService, private authService: AuthService) {
        this.logger = require('node-color-log');
    }

    //#region Create location
    async create(locationAddDto: LocationAddDto, locationImage: Express.Multer.File, request: any): Promise<Location> {

        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id);

        //Time of posting
        var moment = require('moment')
        var timePosted = moment().format('YYYY-MM-DD HH:mm:ss')

        //Creating the user with all of the properties
        const createdLocation = await this.locationRepository.create({
            locationName: locationAddDto.locationName,
            latitude: locationAddDto.latitude,
            longitude: locationAddDto.longitude,
            timePosted: timePosted,
            s3Imagekey: 'null',
            userTk: foundUser
        })
        await this.locationRepository.save(createdLocation);

        const foundLocation = await this.locationRepository.findOne({
            relations: ['userTk'],
            where: {
                locationId: createdLocation.locationId
            }
        });

        const s3Data = await this.s3BucketService.uploadImage(locationImage, foundLocation.locationId, 'locationId', foundLocation.userTk.userId);
        foundLocation.s3Imagekey = s3Data.key;
        //Return creted location and log response
        this.logger.color('blue').success("Location added by user: " + foundUser.email);
        return await this.locationRepository.save(foundLocation);
    }
    //#endregion

    //#region Get locaion by id
    async findOne(locationId: number): Promise<Location> {
        return await this.locationRepository.findOne({
            where: {
                locationId: locationId,
            },
            relations: ['userTk'],
        });
    }
    //#endregion

    //#region Get random location
    async findRandom(): Promise<Location> {
        const locationArray = await this.locationRepository.find({
            relations: ['userTk'],
        });

        this.logger.color('blue').success("Random location returned");
        return locationArray[Math.floor(Math.random() * locationArray.length)];
    }
    //#endregion

    //#region Get all locations (Sort: newest first)
    async findAll(limit: number): Promise<Location[]> {
        const locations = await this.locationRepository.find({
            relations: ['userTk'],
            order: {
                locationId: 'DESC'
            },
            take: limit,
        });
        this.logger.color('blue').success("All locations have been returned and sorted by newest");
        return locations;
    }
    //#endregion

    //#region Get all locations for user (Sort: newest first)
    async findAllUsersLocations(limit: number, request: any) {
        //Gett logged users information
        const data = await this.jwtService.verifyAsync(request.cookies['jwt']);
        const foundUser = await this.authService.findOneUserId(data.id);

        const usersLocations = await this.locationRepository.find({
            where: {
                userTk: foundUser.userId
            },
            take: limit,
            order: {
                locationId: 'DESC'
            },
            relations: ['userTk'],
        });

        this.logger.color('blue').success("All location for user: " + foundUser.email + " returned");
        return usersLocations;
    }
    //#endregion

}