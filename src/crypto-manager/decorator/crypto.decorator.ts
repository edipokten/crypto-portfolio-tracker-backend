// crypto-id.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const CryptoID = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let value = request.query.id;
    console.log({ value });

    if (!value) {
      throw new BadRequestException(
        `The parameter ${data as string} is missing.`,
      );
    }

    if (typeof value === 'string') {
      value = Number(value);
      if (isNaN(value)) {
        throw new BadRequestException(
          `Invalid number format for ${data as string}`,
        );
      }
    }

    if (value < 0) {
      throw new BadRequestException(
        `${data as string} must be a positive number.`,
      );
    }

    return value;
  },
  [
    (target: any, key: string) => {
      // Here it is. Use the `@ApiQuery` decorator purely as a function to define the meta only once here.
      ApiQuery({
        name: 'id',
        required: true,
        description: 'id of the cryptocurrency',
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
    },
  ],
);
