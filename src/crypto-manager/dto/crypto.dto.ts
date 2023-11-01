import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { IsValidOperation, IsValidCryptoName } from '../validator';
import { Cryptocurrency } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCryptoDto {
  @IsString()
  @IsNotEmpty()
  @IsValidCryptoName()
  @ApiProperty({
    example: 'bitcoin',
    description: 'name of the cryptocurrency',
  })
  name: string;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 5,
    description: 'amount of the cryptocurrency',
  })
  amount: number;
}

export class UpdateCryptoDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 4,
    description: 'amount of the cryptocurrency',
  })
  amount: number;

  @IsNotEmpty()
  @IsValidOperation()
  @ApiProperty({
    example: 'update',
    description:
      "operation type of the put operation, can only be 'update', 'substraction', 'addition'",
  })
  operation: string;
}

export class ResponseWithStatus {
  status: string;
  cryptocurrencyData: Cryptocurrency;
  constructor(status: string, cryptocurrencyData: Cryptocurrency) {
    this.cryptocurrencyData = cryptocurrencyData;
    this.status = status;
  }
}
export class GetCryptoResponse {
  id: number;
  name: string;
  cryptoAmount: number;
  cryptoPricePerUnit: number;
  cryptoTotal: number;
  currency: string;

  constructor(
    price: number,
    currency: string,
    cryptocurrencyData: Cryptocurrency,
  ) {
    this.id = cryptocurrencyData.id;
    this.name = cryptocurrencyData.name;
    this.cryptoAmount = cryptocurrencyData.amount;
    this.cryptoPricePerUnit = price;
    this.currency = currency;
    this.cryptoTotal = cryptocurrencyData.amount * price;
  }
}

export class GetCryptoResponseAll {
  cryptocurrencies: GetCryptoResponse[];
  totalAmountInEUR: number;
  constructor(cryptocurrencies: GetCryptoResponse[], totalAmountInEUR: number) {
    this.cryptocurrencies = cryptocurrencies;
    this.totalAmountInEUR = totalAmountInEUR;
  }
}

export class NewCryptoPrice {
  name: string;
  prices: number[];
  cryptoId: number;
  amount: number;
  constructor(
    name: string,
    prices: number[],
    cryptoId: number,
    amount: number,
  ) {
    this.name = name;
    this.prices = prices;
    this.cryptoId = cryptoId;
    this.amount = amount;
  }
}
export class TotalValue {
  calculatedValues: CalculatedValue[];
  totalSum: number[];
}

export interface TotalPrices {
  calculatedValues: CalculatedValue[];
  totalSum: number[];
}

export interface CalculatedValue {
  name: string;
  calculatedPrices: number[];
}
