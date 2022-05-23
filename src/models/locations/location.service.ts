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
        foundLocation.s3Imagekey = s3Data;
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
    async findRandom() {
        const locationArray = await this.locationRepository.find({
            relations: ['userTk'],
        });

        const randomLocation = locationArray[Math.floor(Math.random() * locationArray.length)];
        delete randomLocation.userTk.password;

        //Replace image keys with actuall link to the image
        randomLocation.s3Imagekey = await this.s3BucketService.getImage(randomLocation.s3Imagekey);

        this.logger.color('blue').success("Random location returned");
        return randomLocation;
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

        locations.forEach(element => {
            delete element.userTk.password
        });

        //Replace image keys with actuall link to the image
        for (const location of locations) {
            location.s3Imagekey = await this.s3BucketService.getImage(location.s3Imagekey);
        }

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

        usersLocations.forEach(element => {
            delete element.userTk.password
        });

        //Replace image keys with actuall link to the image
        for (const location of usersLocations) {
            location.s3Imagekey = await this.s3BucketService.getImage(location.s3Imagekey);
        }

        this.logger.color('blue').success("All location for user: " + foundUser.email + " returned");
        return usersLocations;
    }
    //#endregion

    //#region Get specific location
    async findLocation(locationId: number) {
        const foundLocation = await this.locationRepository.findOne({
            where: {
                locationId: locationId
            },
            relations: ['userTk']
        });

        delete foundLocation.userTk.password;

        //Replace image keys with actuall link to the image


        foundLocation.s3Imagekey = await this.s3BucketService.getImage(foundLocation.s3Imagekey);

        foundLocation.userTk.s3Imagekey = await this.s3BucketService.getImage(foundLocation.userTk.s3Imagekey);

        return foundLocation;
    }
    //#endregion

}