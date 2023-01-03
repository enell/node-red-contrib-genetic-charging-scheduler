const { mockRandomForEach } = require('jest-mock-random')
const {
  clamp,
  calculateBatteryChargingStrategy,
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
    let now = Date.now()
    now = now - (now % (60 * 60 * 1000))
    const priceData = [
      { value: 1, start: new Date(now).toString() },
      { value: 500, start: new Date(now + 60 * 60 * 1000).toString() },
      { value: 500, start: new Date(now + 60 * 60 * 1000 * 2).toString() },
    ]
    const populationSize = 100
    const numberOfPricePeriods = 2
    const generations = 500
    const mutationRate = 0.03

    const batteryMaxEnergy = 3 // kWh
    const batteryMaxOutputPower = 3 // kW
    const batteryMaxInputPower = 3 // kW
    const averageConsumption = 1.5 // kW

    const soc = 0

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
      soc,
    }
    const schedule = calculateBatteryChargingStrategy(config)
    console.log(schedule)

    expect(schedule.length).toBeGreaterThan(0)
    expect(schedule[1]).toMatchObject({
      activity: 1,
      name: 'charging',
    })
    expect(schedule[3]).toMatchObject({
      activity: -1,
      name: 'discharging',
    })
  })
})
