const { expect, describe, it } = require('@jest/globals')
const { mockRandomForEach } = require('jest-mock-random')
const {
  clamp,
  repair,
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
    const crossover = crossoverFunction({ totalDuration: 120 })

    const p = crossover(
      {
        periods: [
          { start: 0, activity: 1, duration: 10 },
          { start: 30, activity: -1, duration: 10 },
        ],
        excessPvEnergyUse: 0,
      },
      {
        periods: [
          { start: 60, activity: 1, duration: 10 },
          { start: 80, activity: -1, duration: 10 },
        ],
        excessPvEnergyUse: 0,
      }
    )[0]
    expect(p).toMatchObject({
      periods: [
        { start: 0, activity: 1, duration: 10 },
        { start: 80, activity: -1, duration: 10 },
      ],
      excessPvEnergyUse: 0,
    })
  })
})

describe('Calculate', () => {
  mockRandomForEach(0.4)
  test('calculate', () => {
    let now = Date.now()
    now = now - (now % (60 * 60 * 1000))
    const priceData = [
      { importPrice: 1, exportPrice: 0, start: new Date(now).toString() },
      {
        importPrice: 500,
        exportPrice: 0,
        start: new Date(now + 60 * 60 * 1000).toString(),
      },
      {
        importPrice: 500,
        exportPrice: 0,
        start: new Date(now + 60 * 60 * 1000 * 2).toString(),
      },
    ]
    const productionForecast = priceData.map((v) => {
      return { start: v.start, value: 0 }
    })
    const consumptionForecast = priceData.map((v) => {
      return { start: v.start, value: 1.5 }
    })
    const populationSize = 100
    const numberOfPricePeriods = 2
    const generations = 500
    const mutationRate = 0.03

    const batteryMaxEnergy = 3 // kWh
    const batteryMaxOutputPower = 3 // kW
    const batteryMaxInputPower = 3 // kW
    const averageConsumption = 1.5 // kW
    const averageProduction = 0 // kW
    const soc = 0
    const excessPvEnergyUse = 0

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
      averageProduction,
      productionForecast,
      consumptionForecast,
      soc,
      excessPvEnergyUse,
    }
    const strategy = calculateBatteryChargingStrategy(config)
    const bestSchedule = strategy.best.schedule
    console.log(bestSchedule)

    expect(bestSchedule.length).toEqual(3)
    expect(bestSchedule[0]).toMatchObject({
      activity: 0,
    })
    expect(bestSchedule[1]).toMatchObject({
      activity: -1,
      name: 'discharging',
    })
    expect(bestSchedule[2]).toMatchObject({
      activity: 0,
    })
    expect(strategy.best.excessPvEnergyUse).toEqual(excessPvEnergyUse)
    expect(strategy.best.cost).not.toBeNull()
    expect(strategy.best.cost).not.toBeNaN()

    console.log(`best: ${strategy.best.cost}`)
    console.log(`no battery: ${strategy.noBattery.cost}`)

    const values = bestSchedule
      .filter((e) => e.activity != 0)
      .reduce((total, e) => {
        const toTimeString = (date) => {
          const HH = date.getHours().toString().padStart(2, '0')
          const mm = date.getMinutes().toString().padStart(2, '0')
          return `${HH}:${mm}`
        }

        const touPattern = (start, end, charge) => {
          let pattern = toTimeString(start)
          pattern += '-'
          pattern += toTimeString(end)
          pattern += '/'
          pattern += start.getDay()
          pattern += '/'
          pattern += charge
          return pattern
        }

        const startDate = new Date(e.start)
        const endDate = new Date(startDate.getTime() + (e.duration - 1) * 60000)
        const charge = e.activity == 1 ? '+' : '-'
        if (startDate.getDay() == endDate.getDay()) {
          total.push(touPattern(startDate, endDate, charge))
        } else {
          const endDateDay1 = new Date(startDate)
          endDateDay1.setHours(23)
          endDateDay1.setMinutes(59)
          total.push(touPattern(startDate, endDateDay1, charge))

          const startDateDay2 = new Date(endDate)
          startDateDay2.setHours(0)
          startDateDay2.setMinutes(0)
          total.push(touPattern(startDateDay2, endDate, charge))
        }
        return total
      }, [])
  })
})

describe('Repair', () => {
  it('Repair - one valid gene', () => {
    const p = [{ start: 5, duration: 10 }]
    expect(repair(p, 20)).toEqual(p)
  })

  it('Repair - one valid gene filling all', () => {
    const p = [{ start: 0, duration: 10 }]
    expect(repair(p, 10)).toEqual(p)
  })

  it('Repair - two valid genes', () => {
    const p = [
      { start: 5, duration: 10 },
      { start: 20, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual(p)
  })

  it('Repair - two valid genes in wrong order', () => {
    const p = [
      { start: 20, duration: 10 },
      { start: 5, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 5, duration: 10 },
      { start: 20, duration: 10 },
    ])
  })

  it('Repair - two genes next to each other', () => {
    const p = [
      { start: 5, duration: 10 },
      { start: 15, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 5, duration: 10 },
      { start: 15, duration: 10 },
    ])
  })

  it('Repair - two genes just crossing', () => {
    const p = [
      { start: 5, duration: 10 },
      { start: 14, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 5, duration: 9 },
      { start: 14, duration: 10 },
    ])
  })

  it('Repair - two genes crossing', () => {
    const p = [
      { start: 5, duration: 10 },
      { start: 10, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 5, duration: 7 },
      { start: 12, duration: 8 },
    ])
  })

  it('Repair - three genes crossing', () => {
    const p = [
      { start: 5, duration: 10 },
      { start: 10, duration: 10 },
      { start: 16, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 5, duration: 7 },
      { start: 12, duration: 6 },
      { start: 18, duration: 8 },
    ])
  })

  it('Repair - two genes completely overlapping', () => {
    const p = [
      { start: 5, duration: 10 },
      { start: 5, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 5, duration: 5 },
      { start: 10, duration: 5 },
    ])
  })

  it('Repair - three genes completely overlapping', () => {
    const p = [
      { start: 5, duration: 10 },
      { start: 5, duration: 10 },
      { start: 5, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 5, duration: 5 },
      { start: 10, duration: 0 },
      { start: 10, duration: 5 },
    ])
  })

  it('Repair - start lower than 0', () => {
    const p = [
      { start: -5, duration: 10 },
      { start: 20, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 0, duration: 10 },
      { start: 20, duration: 10 },
    ])
  })

  it('Repair - duration higher than max', () => {
    const p = [
      { start: 0, duration: 10 },
      { start: 45, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 0, duration: 10 },
      { start: 45, duration: 5 },
    ])
  })

  it('Repair - start higher than max', () => {
    const p = [
      { start: 0, duration: 10 },
      { start: 55, duration: 10 },
    ]
    expect(repair(p, 50)).toEqual([
      { start: 0, duration: 10 },
      { start: 49, duration: 1 },
    ])
  })
})
