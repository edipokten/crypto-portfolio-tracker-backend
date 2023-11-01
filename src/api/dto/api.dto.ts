export class CryptoData {
  name: string;
  price: number;
  currency: string;
}

export class RealtimeResponse {
  [key: string]: {
    eur: number;
  };
}
export class HistoricalResponse {
  id: string;
  sparkline_in_7d: { price: number[] };
}

export class ApiPrice {
  name: string;
  price: number;
  currency: string;

  constructor(name: string, price: number, currency: string) {
    this.name = name;
    this.price = price;
    this.currency = currency;
  }
}
export class HistoricalPrices {
  name: string;
  currency: string;
  price: number[];

  constructor(historicalResponse: HistoricalResponse, currency: string) {
    this.name = historicalResponse.id;
    this.price = historicalResponse.sparkline_in_7d.price;
    this.currency = currency;
  }
}
