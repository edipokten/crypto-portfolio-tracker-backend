import { StandardDeviation } from '@prisma/client';

export class Welford {
  private count: number = 0;
  private mean: number = 0;
  private M2: number = 0;
  constructor(initialValue: number = 0) {
    if (initialValue !== 0) {
      this.count = 1;
      this.mean = initialValue;
    }
  }
  addPreviousData(standardDeviation: StandardDeviation) {
    this.count = standardDeviation.count;
    this.mean = standardDeviation.mean;
    this.M2 = standardDeviation.m2;
  }

  getConfiguration() {
    return { count: this.count, mean: this.mean, m2: this.M2 };
  }

  /**
   * Add a new data point to the variance calculation.
   * @param value The new data point.
   */
  addData(value: number): void {
    this.count++;
    const delta = value - this.mean;
    this.mean += delta / this.count;
    const delta2 = value - this.mean;
    this.M2 += delta * delta2;
  }

  /**
   * Get the current variance.
   */
  getVariance(): number {
    if (this.count < 2) {
      return 0;
    }
    return this.M2 / this.count;
  }

  /**
   * Get the current standard deviation.
   */
  getStandardDeviation(): number {
    return Math.sqrt(this.getVariance());
  }
}
