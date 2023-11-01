import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
import {
  RealtimeResponse,
  ApiPrice,
  HistoricalPrices,
  HistoricalResponse,
} from './dto';

@Injectable()
export class ApiService {
  apiUrl = this.config.get('API_BASE_URL');

  constructor(
    private config: ConfigService,
    private http: HttpService,
  ) {}

  /**
   * Transforms the realtime prices fetched from the API to a list of ApiPrice objects.
   * @param {RealtimeResponse} responseData - Response data from the API call.
   * @returns {ApiPrice[]} - Returns an array of ApiPrice objects.
   */
  transformRealtimePrices(responseData: RealtimeResponse): ApiPrice[] {
    return Object.keys(responseData).map((key) => {
      return new ApiPrice(key, responseData[key].eur, 'eur');
    });
  }

  /**
   * Transforms the historical prices fetched from the API to a list of HistoricalPrices objects.
   * @returns {HistoricalPrices[]} - Returns an array of HistoricalPrices objects.
   */
  transformHistoricalPrices(
    responseData: HistoricalResponse[],
    currency: string,
  ): HistoricalPrices[] {
    return responseData.map((data) => {
      return new HistoricalPrices(data, currency);
    });
  }

  /**
   * Fetches the current prices of cryptocurrencies in EUR.
   */
  async getCryptoPricesInEUR(idList: Array<string>): Promise<ApiPrice[]> {
    const idListString = idList.join();
    const request = this.http
      .get(`${this.apiUrl}simple/price`, {
        params: { ids: idListString, vs_currencies: 'eur' },
      })
      .pipe(
        map((resp) => resp.data),
        map((data) => this.transformRealtimePrices(data)),
      )
      .pipe(
        catchError((error) => {
          console.log({ error });
          throw new ForbiddenException('API not available');
        }),
      );
    const cryptoPrices = await lastValueFrom(request);

    return cryptoPrices;
  }

  /**
   * Fetches the historical prices of cryptocurrencies in EUR.
   * @param {string[]} idList - Array of cryptocurrency IDs.
   * @returns {Promise<HistoricalPrices[]>} - Returns a promise that resolves with an array of HistoricalPrices objects.
   */
  async getHistoricalPricesInEUR(
    idList: Array<string>,
  ): Promise<HistoricalPrices[]> {
    const idListString = idList.join();
    const request = this.http
      .get(`${this.apiUrl}coins/markets`, {
        params: { ids: idListString, vs_currency: 'eur', sparkline: true },
      })
      .pipe(
        map((resp) => resp.data),
        map((data) => this.transformHistoricalPrices(data, 'eur')),
      )
      .pipe(
        catchError((error) => {
          console.log({ error });
          throw new ForbiddenException('API not available');
        }),
      );
    const cryptoPrices = await lastValueFrom(request);

    return cryptoPrices;
  }
}
