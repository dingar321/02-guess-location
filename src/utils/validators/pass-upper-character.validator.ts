import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//This checks if the password contains at least one upper character
//If it doesnt it throws an error message


@ValidatorConstraint({ name: 'IsOneUpperChar', async: false })
export class IsOneUpperChar implements ValidatorConstraintInterface {
   
  validate(password: string, args: ValidationArguments) {
   if (password.match(/[A-Z]/) ){
        return true;
      }
      return false
   }

   defaultMessage(args: ValidationArguments) {
      return "Passwords must contain at least one upper character";
   }
}

