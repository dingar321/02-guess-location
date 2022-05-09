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

    async create(locationAddDto: LocationAddDto, locationImage: Express.Multer.File, foundUser: User): Promise<Location> {

        //Time of posting
        var moment = require('moment')
        var timePosted = moment().format('YYYY-MM-DD HH:mm:ss')

        //Getting the s3 key to store in the database
        const s3Data = await this.s3BucketService.uploadImage(locationImage, 'location-images');

        //Creating the user with all of the properties
        const createdLocation = await this.locationRepository.create({
            locationName: locationAddDto.locationName,
            longitude: locationAddDto.longitude,
            latitude: locationAddDto.latitude,
            timePosted: timePosted,
            s3Imagekey: s3Data.key,
            userTk: foundUser
        })

        //Return creted location
        return await this.locationRepository.save(createdLocation);
    }


    async findOne(locationId: number): Promise<Location> {
        return await this.locationRepository.findOne({ locationsId: locationId });
    }

    async findRandom(): Promise<Location> {
        const locationArray = await this.locationRepository.find({
            relations: ['userTk'],
        });

        return locationArray[Math.floor(Math.random() * locationArray.length)];
    }

    async findAll(limit: number): Promise<Location[]> {
        const locations = await this.locationRepository.find({
            relations: ['userTk'],
            order: {
                locationsId: 'DESC'
            },
            take: limit,
        });

        return locations;
    }
}