const { mockRandomForEach } = require('jest-mock-random')
const {
  clamp,
  calculateBatteryChargingStrategy,
  fitnessFunction,
  crossoverFunction,
} = require('../src/strategy-battery-charging-functions')

describe('Util functions', () => {
  test('clamp', () => {
    expect(clamp(1, 0, 10)).toBe(1)
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(10, 0, 10)).toBe(10)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

describe('Fitness', () => {
  test('should calculate fitness score with no periods', () => {
    const priceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 1, start: '2022-12-01T01:00:00.000Z' },
    ]
    let endTime = 2 * 60
    let batteryMaxEnergy = 1
    let batteryMaxInputPower = 1
    let averageConsumption = 1

    let score = fitnessFunction(priceData, endTime, batteryMaxEnergy, batteryMaxInputPower, averageConsumption)([])
    expect(score).toBe(-2)
  })

  test('should calculate fitness score with one charge period', () => {
    const priceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 1, start: '2022-12-01T01:00:00.000Z' },
    ]
    let endTime = 2 * 60
    let batteryMaxEnergy = 1
    let batteryMaxInputPower = 1
    let averageConsumption = 1

    let score = fitnessFunction(
      priceData,
      endTime,
      batteryMaxEnergy,
      batteryMaxInputPower,
      averageConsumption
    )([{ start: 0, activity: 1, duration: 60 }])
    expect(score).toBe(-3)
  })

  test('should calculate fitness score with one discharge period', () => {
    const priceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 1, start: '2022-12-01T01:00:00.000Z' },
    ]
    let endTime = 2 * 60
    let batteryMaxEnergy = 1
    let batteryMaxInputPower = 1
    let averageConsumption = 1

    let score = fitnessFunction(
      priceData,
      endTime,
      batteryMaxEnergy,
      batteryMaxInputPower,
      averageConsumption
    )([{ start: 0, activity: -1, duration: 60 }])
    expect(score).toBe(-2)
  })

  test('should calculate fitness score with charged battery', () => {
    const priceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 2, start: '2022-12-01T01:00:00.000Z' },
    ]
    let endTime = 2 * 60
    let batteryMaxEnergy = 1
    let batteryMaxInputPower = 1
    let averageConsumption = 1

    let fitness = fitnessFunction(priceData, endTime, batteryMaxEnergy, batteryMaxInputPower, averageConsumption)

    expect(
      fitness([
        { start: 0, activity: 1, duration: 60 },
        { start: 60, activity: -1, duration: 60 },
      ])
    ).toBe(-2)

    expect(
      fitness([
        { start: 0, activity: 1, duration: 90 },
        { start: 90, activity: -1, duration: 30 },
      ])
    ).toBe(-3)
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
    console.log(p)
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
    const populationSize = 20
    const numberOfPricePeriods = 8
    const generations = 20
    const mutationRate = 0.03

    const batteryMaxEnergy = 5 //kWh
    const batteryMaxOutputPower = 2.5 //kW
    const batteryMaxInputPower = 2.5 //kW
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
