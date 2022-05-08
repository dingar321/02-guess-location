import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//This checks if the number is a valid latitude
/*
    Latitude measures how far north or south of the equator a place is located. 
    The equator is situated at 0°, the North Pole at 90° north 
    (or 90°, because a positive latitude implies north), 
    and the South Pole at 90° south (or –90°). Latitude measurements range from 0° to (+/–)90°.
*/

@ValidatorConstraint({ name: 'IsLatitude', async: false })
export class IsPassMatch implements ValidatorConstraintInterface {

    validate(latitude: number, args: ValidationArguments) {
        if (latitude < -90 || latitude > 90) {
            return true;
        }
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        return "Latitude must be between -90 and 90 degrees inclusive.";
    }
}