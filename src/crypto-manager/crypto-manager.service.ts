import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CalculatedValue,
  CreateCryptoDto,
  GetCryptoResponse,
  GetCryptoResponseAll,
  NewCryptoPrice,
  ResponseWithStatus,
  TotalValue,
  UpdateCryptoDto,
} from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  CryptoNegativeValueException,
  CryptoNotFoundException,
} from './exception';
import { ApiService } from 'src/api/api.service';
import { Cryptocurrency, StandardDeviation } from '@prisma/client';
import { Welford } from './std-calculator';

@Injectable()
export class CryptoManagerService {
  constructor(
    private prisma: PrismaService,
    private api: ApiService,
  ) {}

  /**
   * Creates a new cryptocurrency record.
   * It fetches the latest price for the given cryptocurrency and stores it in the database.
   * If the cryptocurrency already exists, it throws a ForbiddenException.
   */
  async create(dto: CreateCryptoDto): Promise<unknown> {
    const lastPriceFromApi = await this.getLastPriceFromApi(dto.name);
    const createdCrypto = await this.prisma.cryptocurrency
      .create({
        data: {
          name: dto.name,
          amount: dto.amount,
          prices: {
            create: {
              date: new Date(),
              priceInEur: String(lastPriceFromApi),
            },
          },
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new ForbiddenException(
              `There is a unique constraint violation, ${dto.name} already created`,
            );
          }
        }
        throw e;
      });

    return new ResponseWithStatus('created', createdCrypto);
  }
  /**
   * Fetches a specific cryptocurrency record by its ID.
   */
  async findOne(id: number): Promise<GetCryptoResponse> {
    const crypto = await this.getCryptoById(id);
    console.log({ crypto });

    const apiData = await this.api.getCryptoPricesInEUR([crypto.name]);

    const respData = new GetCryptoResponse(
      apiData[0].price,
      apiData[0].currency,
      crypto,
    );
    return respData;
  }
  /**
   * Fetches all the stored cryptocurrency records.
   *  Returns a list of all cryptocurrencies along with their current prices from an external API and the sum of all cryptocurrency values.
   */
  async findAll(): Promise<GetCryptoResponseAll> {
    const cryptoCurrencies = await this.getAllCryptocurrencies();
    const cryptoNameList = cryptoCurrencies.map((crypto) => crypto.name);

    const apiDataList = await this.api.getCryptoPricesInEUR(cryptoNameList);

    let sum = 0;

    const respDataList = cryptoCurrencies.map((crypto) => {
      const apiData = apiDataList.filter((d) => d.name === crypto.name);
      const getCryptoResponse = new GetCryptoResponse(
        apiData[0].price,
        apiData[0].currency,
        crypto,
      );
      sum = sum + getCryptoResponse.cryptoTotal;
      return getCryptoResponse;
    });

    return new GetCryptoResponseAll(respDataList, sum);
  }
  /**
   * Updates a specific cryptocurrency record by its ID.
   * @param {number} id - ID of the cryptocurrency to be updated.
   * @param {UpdateCryptoDto} dto - Data transfer object containing the details of the update.
   * @returns {ResponseWithStatus} - Returns the response status along with the updated cryptocurrency data.
   */
  async update(id: number, dto: UpdateCryptoDto): Promise<ResponseWithStatus> {
    let amount = Number();

    const crypto = await this.getCryptoById(id);
    switch (dto.operation) {
      case 'addition':
        amount = crypto.amount + dto.amount;
        break;

      case 'subtraction':
        amount = crypto.amount - dto.amount;
        break;

      case 'update':
        amount = dto.amount;
        break;
    }

    if (amount < 0) {
      throw new CryptoNegativeValueException();
    }
    const updatedCrypto = await this.prisma.cryptocurrency.update({
      where: {
        id: id,
      },
      data: {
        amount: amount,
      },
    });
    return new ResponseWithStatus('updated', updatedCrypto);
  }
  /**
   * Deletes a specific cryptocurrency record by its ID.
   * @param {number} id - ID of the cryptocurrency to be deleted.
   * @returns {ResponseWithStatus} - Returns the response status along with the deleted cryptocurrency data.
   */
  async remove(id: number): Promise<ResponseWithStatus> {
    const crypto = await this.prisma.cryptocurrency
      .delete({
        where: {
          id: id,
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2025' || e.code === 'P2016') {
            throw new NotFoundException(
              `Can't find cryptocurrency with id ${id}`,
            );
          }
        }
        throw e;
      });
    delete crypto.createdAt && delete crypto.updatedAt;

    return new ResponseWithStatus('deleted', crypto);
  }
  // Private helper method to fetch a specific cryptocurrency by its ID from the database.
  async getCryptoById(id: number): Promise<Cryptocurrency | null> {
    const crypto = await this.prisma.cryptocurrency.findUnique({
      where: { id },
    });

    console.log({ crypto });

    if (crypto == null) {
      throw new CryptoNotFoundException();
    }
    return crypto;
  }
  // Private helper method to fetch all cryptocurrency records from the database.
  async getAllCryptocurrencies(): Promise<Cryptocurrency[] | null> {
    const cryptoCurrencies = await this.prisma.cryptocurrency.findMany();

    if (cryptoCurrencies.length === 0) {
      throw new CryptoNotFoundException();
    }
    return cryptoCurrencies;
  }
  // Private helper method to fetch all cryptocurrency records and their recent price from the database.
  async getAllCryptocurrenciesWithLastPrice() {
    return await this.prisma.cryptocurrency.findMany({
      select: {
        id: true,
        name: true,
        amount: true,
        prices: {
          orderBy: {
            id: 'desc',
          },
          take: 1,
        },
      },
    });
  }
  /**
   * Fetches the latest price for a given cryptocurrency name from an external API.
   * @param {string} name - Name of the cryptocurrency to fetch the price for.
   * @returns {Promise<number>} - Returns the latest price of the cryptocurrency.
   */
  async getLastPriceFromApi(name: string): Promise<number> {
    const historicalPricesFromApi = await this.api.getHistoricalPricesInEUR([
      name,
    ]);
    const historicalPriceFromApi = historicalPricesFromApi.find(
      (p) => p.name == name,
    );
    const lastHistoricalPriceFromApi =
      historicalPriceFromApi.price[historicalPriceFromApi.price.length - 1];

    return lastHistoricalPriceFromApi;
  }
  /**
   * Calculates a new standard deviation based on new prices from the stream.
   * @returns {Promise<object>} - Returns the calculated standard deviation or a message indicating no new prices in the stream.
   */
  async getNewStandardDeviationCalculation(): Promise<object> {
    const newPrices = await this.getNewPricesFromStream();
    const isNewPrice = newPrices[0].prices.length === 0 ? false : true;
    if (!isNewPrice) {
      return { message: 'there is no new price in the stream' };
    }
    const totalValueCalculation = this.calculateTotalValue(newPrices);
    console.log({ totalValueCalculation });
    const calculatedStandardDeviation = await this.calculateStandardDeviation(
      totalValueCalculation,
    );
    return { calculatedStandardDeviation };
  }
  /**
   * Fetches all standard deviation calculations or computes a new one if none exist.
   * @returns {Promise<StandardDeviation[]>} - Returns a list of all standard deviation calculations or computes a new one.
   */
  async getAllStandardDeviationCalculation() {
    const deviationCalculations = await this.prisma.standardDeviation.findMany({
      select: {
        id: true,
        date: true,
        standardDeviation: true,
      },
    });
    return deviationCalculations.length == 0
      ? await this.getNewStandardDeviationCalculation()
      : deviationCalculations;
  }
  /**
   * Calculates the standard deviation for the total value of all cryptocurrencies.
   * @param {TotalValue} totalValue - Total value data used for the standard deviation calculation.
   */
  async calculateStandardDeviation(totalValue: TotalValue) {
    const totalPrices = totalValue.totalSum;

    const lastStd = await this.getLastStandardDeviation();
    const welford = new Welford();
    if (lastStd) {
      welford.addPreviousData(lastStd);
    }

    return Promise.all(
      totalPrices.map(async (number) => {
        welford.addData(number);
        const std = welford.getStandardDeviation();
        const config = welford.getConfiguration();

        return await this.prisma.standardDeviation.create({
          data: {
            m2: config.m2,
            count: config.count,
            standardDeviation: std,
            mean: config.mean,
          },
          select: {
            id: true,
            date: true,
            standardDeviation: true,
          },
        });
      }),
    );
  }

  calculateTotalValue(newPrices: NewCryptoPrice[]): TotalValue {
    const calculatedValues: CalculatedValue[] = newPrices.map((crypto) => {
      const calculatedPrices = crypto.prices.map(
        (price) => crypto.amount * price,
      );
      return { name: crypto.name, calculatedPrices };
    });

    const totalSum: number[] = calculatedValues.reduce((acc, curr) => {
      curr.calculatedPrices.forEach((value, index) => {
        if (acc[index] === undefined) {
          acc[index] = 0;
        }
        acc[index] += value;
      });
      return acc;
    }, []);

    return { calculatedValues, totalSum };
  }
  /**
   * Fetches the last standard deviation calculation from the database.
   * @returns {Promise<StandardDeviation>} - Returns the last standard deviation calculation.
   */
  async getLastStandardDeviation(): Promise<StandardDeviation> {
    return this.prisma.standardDeviation.findFirst();
  }

  /**
   * Fetches new prices for all cryptocurrencies from an external stream.
   * @returns {Promise<NewCryptoPrice[]>} - Returns a list of new cryptocurrency prices.
   */
  async getNewPricesFromStream(): Promise<NewCryptoPrice[]> {
    const cryptoWithLastPrices =
      await this.getAllCryptocurrenciesWithLastPrice();

    if (cryptoWithLastPrices.length == 0) {
      throw new NotFoundException('There is no new records in the stream');
    }
    const cryptoNameList = cryptoWithLastPrices.map((crypto) => crypto.name);

    const historicalPricesFromApi =
      await this.api.getHistoricalPricesInEUR(cryptoNameList);
    console.log({ historicalPricesFromApi });

    const newPrices = historicalPricesFromApi.map((historicalPrice) => {
      const cryptoWithLastPrice = cryptoWithLastPrices.find(
        (c) => c.name === historicalPrice.name,
      );
      const prices = historicalPrice.price.reverse();
      for (let i = 0; i < prices.length; i++) {
        if (prices[i] === Number(cryptoWithLastPrice.prices[0].priceInEur)) {
          prices.splice(i);
          break;
        }
      }

      return new NewCryptoPrice(
        historicalPrice.name,
        prices.reverse(),
        cryptoWithLastPrice.prices[0].cryptoId,
        cryptoWithLastPrice.amount,
      );
    });
    console.log({ newPrices });
    if (newPrices[0].prices.length == 0) {
      throw new NotFoundException('There is no new records in the stream');
    }

    newPrices.forEach((crypto) => {
      crypto.prices.forEach(async (newPrice) => {
        await this.prisma.priceHistory.create({
          data: {
            date: new Date(),
            priceInEur: String(newPrice),
            cryptocurrency: { connect: { id: crypto.cryptoId } },
          },
        });
      });
    });

    return newPrices;
  }
}
