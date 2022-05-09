import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { IsPassMatch } from "src/common/validators/pass-confirm.validator";
import { IsOneLowerChar } from "src/common/validators/pass-lower-character.validator";
import { IsOneNumericDigit } from "src/common/validators/pass-numeric-digit.validator";
import { IsOneSpecialChar } from "src/common/validators/pass-special-character.validator";
import { IsOneUpperChar } from "src/common/validators/pass-upper-character.validator";

export class ResetPasswordDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly resetToken: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    //Checks the min length of the password
    @MinLength(8)
    //Checks the min length of the password
    @MaxLength(255)
    //Checks if the password contains at least one upper case character
    @Validate(IsOneUpperChar, ['password'])
    //Checks if the password contains at least one lower case character
    @Validate(IsOneLowerChar, ['password'])
    //Checks if the password contains at least one numeric digit
    @Validate(IsOneNumericDigit, ['password'])
    //Checks if the password contains at least one special character
    @Validate(IsOneSpecialChar, ['password'])
    readonly password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    //Checks if the passwords match
    @Validate(IsPassMatch, ['password'])
    readonly passwordConfirm: string;

}