import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { IsPassMatch } from "src/utils/validators/pass-confirm.validator";
import { IsOneLowerChar } from "src/utils/validators/pass-lower-character.validator";
import { IsOneNumericDigit } from "src/utils/validators/pass-numeric-digit.validator";
import { IsOneSpecialChar } from "src/utils/validators/pass-special-character.validator";
import { IsOneUpperChar } from "src/utils/validators/pass-upper-character.validator";

export class ChangePasswordDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    //Checks the min length of the password
    @MinLength(8)
    //Checks the min length of the password
    @MaxLength(24)
    //Checks if the password contains at least one upper case character
    @Validate(IsOneUpperChar, ['password'])
    //Checks if the password contains at least one lower case character
    @Validate(IsOneLowerChar, ['password'])
    //Checks if the password contains at least one numeric digit
    @Validate(IsOneNumericDigit, ['password'])
    //Checks if the password contains at least one special character
    @Validate(IsOneSpecialChar, ['password'])
    password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    //Checks if the passwords match
    @Validate(IsPassMatch, ['password'])
    passwordConfirm: string;
}