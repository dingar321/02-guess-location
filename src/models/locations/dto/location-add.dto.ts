import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNotEmpty, IsString, Validate } from "class-validator";

export class LocationAddDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly locationName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(IsLongitude, ['longitude'])
    readonly longitude: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(IsLatitude, ['latitude'])
    readonly latitude: number;

}