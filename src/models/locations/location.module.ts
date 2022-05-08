import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/authentication/auth.module";
import { ImageUploadeService } from "src/utils/S3Service/image-uploade.service";
import { Location } from "./entities/location.entity";
import { LocationController } from "./location.controller";
import { LocationService } from "./location.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Location]),

        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' }
        }),

        //Imported modules
        AuthModule,
    ],
    controllers: [LocationController],
    providers: [LocationService, ImageUploadeService],
    exports: [LocationService],
})
export class LocationModule { }