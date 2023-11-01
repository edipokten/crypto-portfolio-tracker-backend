import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidCryptoNameConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    return value === 'bitcoin' || value === 'ethereum';
  }

  defaultMessage(): string {
    return "Name must be 'bitcoin' or 'ethereum'";
  }
}

export function IsValidCryptoName() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      validator: IsValidCryptoNameConstraint,
    });
  };
}

@ValidatorConstraint({ async: false })
export class IsValidOperationConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    return (
      value === 'addition' || value === 'subtraction' || value === 'update'
    );
  }

  defaultMessage(): string {
    return "Operation must be 'addition', 'subtraction' or 'update'";
  }
}

export function IsValidOperation() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      validator: IsValidOperationConstraint,
    });
  };
}
