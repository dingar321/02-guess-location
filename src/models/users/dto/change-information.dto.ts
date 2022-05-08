import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ChangeInformationDto {

    @ApiProperty()
    @IsString()
    @MaxLength(255)
    @IsEmail()
    readonly email: string;

    @ApiProperty()
    @IsString()
    @MaxLength(255)
    readonly firstName: string;

    @ApiProperty()
    @IsString()
    @MaxLength(255)
    readonly lastName: string;

}