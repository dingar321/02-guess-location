import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//This checks if the password contains at least one lower case character
//If it doesnt it throws an error message


@ValidatorConstraint({ name: 'IsOneLowerChar', async: false })
export class IsOneLowerChar implements ValidatorConstraintInterface {
   
  validate(password: string, args: ValidationArguments) {
      if (password.match(/[a-z]/) ){
        return true;
      }
      return false
   }

   defaultMessage(args: ValidationArguments) {
      return "Passwords must contain at least one lower case character";
   }
}

