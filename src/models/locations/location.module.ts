import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/authentication/auth.module";
import { S3BucketService } from "src/utils/s3-bucket/s3-bucket.service";
import { Location } from "./entities/location.entity";
import { LocationController } from "./location.controller";
import { LocationService } from "./location.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Location]),

        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME }
        }),

        //Imported modules
        AuthModule,
    ],
    controllers: [LocationController],
    providers: [LocationService, S3BucketService],
    exports: [LocationService],
})
export class LocationModule { }