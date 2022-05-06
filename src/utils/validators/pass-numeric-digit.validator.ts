import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//This checks if the password contains at least one numeric digit
//If it doesnt it throws an error message


@ValidatorConstraint({ name: 'IsOneNumericDigit', async: false })
export class IsOneNumericDigit implements ValidatorConstraintInterface {
   
  validate(password: string, args: ValidationArguments) {
      if (password.match(/[0-9]/) ){
        return true;
      }
      return false
   }

   defaultMessage
   (args: ValidationArguments) {
      return "Passwords must contain at least one numeric digit";
   }
}

