import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//This checks if the number is a valid longitude
/*
    Longitude measures how far east or west of the prime meridian a place is located. 
    The prime meridian runs through Greenwich, England. 
    Longitude measurements range from 0° to (+/–)180°.
*/

@ValidatorConstraint({ name: 'IsLongitude', async: false })
export class IsPassMatch implements ValidatorConstraintInterface {

    validate(longitude: number, args: ValidationArguments) {
        if (longitude < -180 || longitude > 180) {
            return true;
        }
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        return "Longitude must be between -180 and 180 degrees inclusive.";
    }
}