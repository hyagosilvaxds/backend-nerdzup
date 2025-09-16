import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsUrlOrPath(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUrlOrPath',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Check if it's a valid URL (starts with http:// or https://)
          const urlRegex = /^https?:\/\/.+/;
          if (urlRegex.test(value)) {
            return true;
          }

          // Check if it's a valid relative path (starts with /)
          const pathRegex = /^\/[^\s]*$/;
          if (pathRegex.test(value)) {
            return true;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid URL or relative path`;
        },
      },
    });
  };
}
