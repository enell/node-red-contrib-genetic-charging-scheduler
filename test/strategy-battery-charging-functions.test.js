import { mockRandomForEach } from 'jest-mock-random'
import {
  clamp,
  calculateBatteryChargingStrategy,
  crossoverFunction,
} from '../src/strategy-battery-charging-functions'

describe('Util functions', () => {
  test('clamp', () => {
    expect(clamp(1, 0, 10)).toBe(1)
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

describe('Crossover', () => {
  mockRandomForEach(0.4)

  test('should perform a crossover', () => {
    const crossover = crossoverFunction(120)

    const p = crossover(
      [
        { start: 0, activity: 1, duration: 10 },
        { start: 30, activity: -1, duration: 10 },
      ],
      [
        { start: 60, activity: 1, duration: 10 },
        { start: 80, activity: -1, duration: 10 },
      ]
    )[0]
    expect(p).toMatchObject([
      { start: 0, activity: 1, duration: 10 },
      { start: 80, activity: -1, duration: 10 },
    ])
  })
})

describe('Calculate', () => {
  test('calculate', () => {
    const priceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 2, start: '2022-12-01T01:00:00.000Z' },
      { value: 5, start: '2022-12-01T02:00:00.000Z' },
    ]
    const populationSize = 100
    const numberOfPricePeriods = 8
    const generations = 500
    const mutationRate = 0.03

    const batteryMaxEnergy = 5 // kWh
    const batteryMaxOutputPower = 2.5 // kW
    const batteryMaxInputPower = 2.5 // kW
    const averageConsumption = 1.5 // kW

    const config = {
      priceData,
      populationSize,
      numberOfPricePeriods,
      generations,
      mutationRate,
      batteryMaxEnergy,
      batteryMaxOutputPower,
      batteryMaxInputPower,
      averageConsumption,
    }
    console.log(calculateBatteryChargingStrategy(config))
  })
})
