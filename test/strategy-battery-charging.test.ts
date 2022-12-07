import { clamp, calculateBatteryChargingStrategy, PriceData } from "../src/strategy-battery-charging";


describe('Battery charging strategy', () => {
  test('clamp', () => {
    expect(clamp(1, 0, 10)).toBe(1)
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
    expect(clamp(11, 0, 10)).toBe(10)
  });

  test('calculate', () => {
    const priceData: PriceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 2, start: '2022-12-01T01:00:00.000Z' },
      { value: 5, start: '2022-12-01T02:00:00.000Z' },
    ]
    const populationSize = 20
    const numberOfPricePeriods = 8
    const generations = 400
    const mutationRate = 0.03
    const config = {
      priceData,
      populationSize,
      numberOfPricePeriods,
      generations,
      mutationRate,
    }

    calculateBatteryChargingStrategy(config)
  })
});
