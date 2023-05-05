const { expect, describe } = require('@jest/globals')
const {
  fitnessFunction,
  splitIntoHourIntervals,
  allPeriods,
  calculatePeriodScore,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
} = require('../src/fitness')

let props

beforeEach(() => {
  let now = Date.now()
  now = now - (now % (60 * 60 * 1000))
  const input = [
    {
      start: new Date(now).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: new Date(now + 60 * 60 * 1000).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: new Date(now + 60 * 60 * 1000 * 2).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: new Date(now + 60 * 60 * 1000 * 3).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: new Date(now + 60 * 60 * 1000 * 4).toString(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
  ]
  props = {
    input,
    totalDuration: input.length * 60,
    batteryMaxEnergy: 1,
    batteryMaxInputPower: 1,
    batteryMaxOutputPower: 1,
    soc: 1,
  }
})

describe('Fitness - splitIntoHourIntervals', () => {
  test('should split into one intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 0, activity: 1, duration: 60 })
    ).toMatchObject([{ start: 0, activity: 1, duration: 60 }])
  })
  test('should split into two intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 0, activity: 1, duration: 90 })
    ).toMatchObject([
      { start: 0, activity: 1, duration: 60 },
      { start: 60, activity: 1, duration: 30 },
    ])
  })
  test('should split into hour two 30min intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 30, activity: 1, duration: 60 })
    ).toMatchObject([
      { start: 30, activity: 1, duration: 30 },
      { start: 60, activity: 1, duration: 30 },
    ])
  })
  test('should split into 3 intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 30, activity: 1, duration: 120 })
    ).toMatchObject([
      { start: 30, activity: 1, duration: 30 },
      { start: 60, activity: 1, duration: 60 },
      { start: 120, activity: 1, duration: 30 },
    ])
  })
})

describe('Fitness - allPeriods', () => {
  test('should test allPeriods empty', () => {
    expect(
      allPeriods(props, { excessPvEnergyUse: 0, periods: [] })
    ).toMatchObject([{ start: 0, duration: 300, activity: 0 }])
  })

  test('should test allPeriods one activity', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: [{ start: 0, duration: 300, activity: 1 }],
      })
    ).toMatchObject([{ start: 0, duration: 300, activity: 1 }])
  })

  test('should test allPeriods one in the middle', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: [{ start: 120, duration: 60, activity: 1 }],
      })
    ).toMatchObject([
      { start: 0, duration: 120, activity: 0 },
      { start: 120, duration: 60, activity: 1 },
      { start: 180, duration: 120, activity: 0 },
    ])
  })

  test('should test allPeriods one long activity', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: [{ start: 100, duration: 100, activity: 1 }],
      })
    ).toMatchObject([
      { start: 0, duration: 100, activity: 0 },
      { start: 100, duration: 100, activity: 1 },
      { start: 200, duration: 100, activity: 0 },
    ])
  })

  test('should test allPeriods two activities', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: [
          { start: 70, activity: 1, duration: 80 },
          { start: 160, activity: -1, duration: 30 },
        ],
      })
    ).toMatchObject([
      { start: 0, duration: 70, activity: 0 },
      { start: 70, duration: 80, activity: 1 },
      { start: 150, duration: 10, activity: 0 },
      { start: 160, duration: 30, activity: -1 },
      { start: 190, duration: 110, activity: 0 },
    ])
  })
})

describe('Fitness - calculateScore', () => {
  describe('Fitness - calculateDischargeScore', () => {
    test('should discharge full hour, full battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 1,
        })
      ).toEqual([0, -1])
    })

    test('should discharge full hour, empty battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 0,
        })
      ).toEqual([2, 0])
    })

    test('should discharge full hour, almost empty battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 0.5,
        })
      ).toEqual([1, -0.5])
    })

    test('should discharge full hour, full battery, equal production', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxDischarge: 1,
        })
      ).toEqual([0, 0])
    })

    test('should discharge full hour, full battery, double production', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxDischarge: 1,
        })
      ).toEqual([-2, 0])
    })

    test('should discharge full hour, full battery, double production, charge preference', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxDischarge: 1,
          maxCharge: 1,
          excessPvEnergyUse: 1,
        })
      ).toEqual([0, 1])
    })
  })

  describe('Fitness - calculateChargeScore', () => {
    test('should charge full hour, full battery', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 0,
        })
      ).toEqual([2, 0])
    })

    test('should charge full hour, empty battery', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 1,
        })
      ).toEqual([4, 1])
    })

    test('should charge full hour, almost full battery', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 0.5,
        })
      ).toEqual([3, 0.5])
    })

    test('should charge full hour, empty battery, equal production', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxCharge: 1,
        })
      ).toEqual([2, 1])
    })

    test('should charge full hour, empty battery, double production', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
        })
      ).toEqual([0, 1])
    })

    test('should charge full hour, empty battery, triple production, charge preference', () => {
      expect(
        calculateChargeScore({
          duration: 1,
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 3,
          maxCharge: 1,
          excessPvEnergyUse: 1,
        })
      ).toEqual([-2, 1])
    })
  })

  describe('Fitness - calculateNormalScore', () => {
    test('should consume normal full hour no production', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 1,
        })
      ).toEqual([2, 0])
    })

    test('should consume normal full hour with equal production', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxCharge: 1,
        })
      ).toEqual([0, 0])
    })

    test('should consume normal full hour with double production, charge preference', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          excessPvEnergyUse: 1,
        })
      ).toEqual([0, 1])
    })

    test('should consume normal full hour with double production, feed to grid preference', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          excessPvEnergyUse: 0,
        })
      ).toEqual([-2, 0])
    })
  })

  describe('Fitness - calculatePeriodScore', () => {
    test('shod not charge faster than max input power', () => {
      const period = { start: 0, duration: 1, activity: 1 }
      const currentCharge = 0
      const excessPvEnergyUse = 0
      const score = calculatePeriodScore(
        props,
        period,
        excessPvEnergyUse,
        currentCharge
      )
      const chargeSpeed = score[1] / (1 / 60)
      expect(chargeSpeed).toBeCloseTo(props.batteryMaxInputPower)
      expect(score[0]).toBeCloseTo(2 / 60)
      expect(score[1]).toBeCloseTo(1 / 60)
    })

    test('shod not discharge faster than max output power', () => {
      const period = { start: 0, duration: 1, activity: -1 }
      const currentCharge = 100
      const excessPvEnergyUse = 0
      const score = calculatePeriodScore(
        props,
        period,
        excessPvEnergyUse,
        currentCharge
      )
      const dischargeSpeed = (score[1] / (1 / 60)) * -1
      expect(dischargeSpeed).toBeCloseTo(props.batteryMaxOutputPower)
      expect(score[0]).toBeCloseTo(0)
      expect(score[1]).toBeCloseTo((1 / 60) * -1)
    })
  })
})

describe('Fitness', () => {
  test('should calculate fitness', () => {
    props.totalDuration = 180
    props.soc = 0
    const score = fitnessFunction(props)({
      periods: [
        { start: 30, duration: 60, activity: 1 },
        { start: 90, duration: 30, activity: -1 },
      ],
      excessPvEnergyUse: 0,
    })
    expect(score).toEqual(-3.5)
  })

  test('should calculate fitness with soc', () => {
    props.totalDuration = 120
    props.soc = 1
    const score = fitnessFunction(props)({
      periods: [
        { start: 30, duration: 60, activity: 1 },
        { start: 90, duration: 30, activity: -1 },
      ],
      excessPvEnergyUse: 0,
    })
    expect(score).toEqual(-1.5)
  })

  test('should calculate 180 min charge period with full battery', () => {
    props.totalDuration = 180
    props.soc = 1
    let now = Date.now()
    now = now - (now % (60 * 60 * 1000))
    props.input = [
      {
        start: new Date(now).toString(),
        importPrice: 1,
        exportPrice: 1,
        consumption: 1.5,
        production: 0,
      },
      {
        start: new Date(now + 60 * 60 * 1000).toString(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0,
      },
      {
        start: new Date(now + 60 * 60 * 1000 * 2).toString(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0,
      },
    ]
    let score = fitnessFunction(props)({
      periods: [{ start: 0, duration: 180, activity: 1 }],
      excessPvEnergyUse: 0,
    })
    expect(score).toEqual(-1501.5)
  })
})
