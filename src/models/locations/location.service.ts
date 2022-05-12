import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import console from "console";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { S3BucketService } from "src/common/s3-bucket/s3-bucket.service";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { LocationAddDto } from "./dto/location-add.dto";
import { Location } from "./entities/location.entity";

@Injectable()
export class LocationService {
    constructor(@InjectRepository(Location) private readonly locationRepository: Repository<Location>, private s3BucketService: S3BucketService) { }

    //#region Create location
    async create(locationAddDto: LocationAddDto, locationImage: Express.Multer.File, foundUser: User): Promise<Location> {

        //Time of posting
        var moment = require('moment')
        var timePosted = moment().format('YYYY-MM-DD HH:mm:ss')

        //Getting the s3 key to store in the database
        //const s3Data = await this.s3BucketService.uploadImage(locationImage, 'location-images');

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
        //Return creted location
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

        return locations;
    }
    //#endregion

    //#region Get all locations for user (Sort: newest first)
    async findAllUsersLocations(userId: number, limit: number) {
        const usersLocations = await this.locationRepository.find({
            where: {
                userTk: userId
            },
            take: limit,
            order: {
                locationId: 'DESC'
            },
            relations: ['userTk'],
        });

        return usersLocations;
    }
    //#endregion

}