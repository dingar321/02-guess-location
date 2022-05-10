import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly email: string;


}