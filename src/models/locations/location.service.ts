import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageUploadeService } from "src/utils/S3Service/image-uploade.service";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { LocationAddDto } from "./dto/location-add.dto";
import { Location } from "./entities/location.entity";

@Injectable()
export class LocationService {
    constructor(@InjectRepository(Location) private readonly locationRepository: Repository<Location>, private imageUploadeService: ImageUploadeService) { }

    async create(locationAddDto: LocationAddDto, locationImage: Express.Multer.File, foundUser: User): Promise<Location> {

        //Time of posting
        var moment = require('moment')
        var timePosted = moment().format('YYYY-MM-DD HH:mm:ss')

        //Getting the s3 key/data to store in the database
        const s3Data = await this.imageUploadeService.uploadImage(locationImage);

        //Creating the user with all of the properties
        const createdLocation = await this.locationRepository.create({
            locationName: locationAddDto.locationName,
            longitude: locationAddDto.longitude,
            latitude: locationAddDto.latitude,
            timePosted: timePosted,
            s3key: s3Data.key,
            s3Data: s3Data,
            userTk: foundUser
        })

        //Return creted location
        return await this.locationRepository.save(createdLocation);
    }


    async findOne(locationId: number): Promise<Location> {
        return await this.locationRepository.findOne({ locationsId: locationId });
    }
}