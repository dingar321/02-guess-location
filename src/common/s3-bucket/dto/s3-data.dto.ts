import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class S3DataDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly eTag: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly versionId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly location: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly key: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly bucket: string;
}