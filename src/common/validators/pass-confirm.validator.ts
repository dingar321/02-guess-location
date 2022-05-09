import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

//This checks if the password and the retyped password for confirmation match !
//If they dont it throws an error


@ValidatorConstraint({ name: 'IsPassMatch', async: false })
export class IsPassMatch implements ValidatorConstraintInterface {
   
  validate(password: string, args: ValidationArguments) {
      if (password !== (args.object as any)[args.constraints[0]]) return false;
      return true;
   }

   defaultMessage(args: ValidationArguments) {
      return "Passwords must match";
   }
}

