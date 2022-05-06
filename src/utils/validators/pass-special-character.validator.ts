import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//This checks if the password contains at least one special character
//If it doesnt it throws an error message


@ValidatorConstraint({ name: 'IsOneSpecialChar', async: false })
export class IsOneSpecialChar implements ValidatorConstraintInterface {

   validate(password: string, args: ValidationArguments) {
      if (password.match(/[^a-zA-Z0-9-._]/)) {
         return true;
      }
      return false
   }

   defaultMessage(args: ValidationArguments) {
      return "Passwords must contain at least one special character";
   }
}

