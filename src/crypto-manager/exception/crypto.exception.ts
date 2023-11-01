import { HttpException, HttpStatus } from '@nestjs/common';

export class CryptoNotFoundException extends HttpException {
  constructor(message?: string, status?: HttpStatus) {
    super(message || 'Crypto Not Found', status || HttpStatus.NOT_FOUND);
  }
}
export class CryptoNegativeValueException extends HttpException {
  constructor(message?: string, status?: HttpStatus) {
    super(
      message ||
        ' The cryptocurrency subtraction cannot result in a negative value.',
      status || HttpStatus.BAD_REQUEST,
    );
  }
}
