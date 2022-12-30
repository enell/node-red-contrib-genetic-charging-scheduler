const {
  fitnessFunction,
  splitIntoHourIntervals,
  fillInNormalPeriods,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
} = require('../src/fitness')

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

  // test('should calculate fitness score with no periods', () => {
  //   const priceData = [
  //     { value: 1, start: '2022-12-01T00:00:00.000Z' },
  //     { value: 1, start: '2022-12-01T01:00:00.000Z' },
  //   ]
  //   let endTime = 2 * 60
  //   let batteryMaxEnergy = 1
  //   let batteryMaxInputPower = 1
  //   let averageConsumption = 1

  //   let score = fitnessFunction({
  //     priceData,
  //     endTime,
  //     batteryMaxEnergy,
  //     batteryMaxInputPower,
  //     averageConsumption,
  //   })([])
  //   expect(score).toBe(-2)
  // })

  // test('should calculate fitness score with one charge period', () => {
  //   const priceData = [
  //     { value: 1, start: '2022-12-01T00:00:00.000Z' },
  //     { value: 1, start: '2022-12-01T01:00:00.000Z' },
  //   ]
  //   let endTime = 2 * 60
  //   let batteryMaxEnergy = 1
  //   let batteryMaxInputPower = 1
  //   let averageConsumption = 1

  //   let score = fitnessFunction({ priceData, endTime, batteryMaxEnergy, batteryMaxInputPower, averageConsumption })([
  //     { start: 0, activity: 1, duration: 60 },
  //   ])
  //   expect(score).toBe(-3)
  // })

  // test('should calculate fitness score with one discharge period', () => {
  //   const priceData = [
  //     { value: 1, start: '2022-12-01T00:00:00.000Z' },
  //     { value: 1, start: '2022-12-01T01:00:00.000Z' },
  //   ]
  //   let endTime = 2 * 60
  //   let batteryMaxEnergy = 1
  //   let batteryMaxInputPower = 1
  //   let averageConsumption = 1

  //   let score = fitnessFunction({ priceData, endTime, batteryMaxEnergy, batteryMaxInputPower, averageConsumption })([
  //     { start: 0, activity: -1, duration: 60 },
  //   ])
  //   expect(score).toBe(-2)
  // })

  // test('should calculate fitness score with charged battery', () => {
  //   const priceData = [
  //     { value: 1, start: '2022-12-01T00:00:00.000Z' },
  //     { value: 2, start: '2022-12-01T01:00:00.000Z' },
  //   ]
  //   let endTime = 2 * 60
  //   let batteryMaxEnergy = 1
  //   let batteryMaxInputPower = 1
  //   let averageConsumption = 1

  //   let fitness = fitnessFunction({ priceData, endTime, batteryMaxEnergy, batteryMaxInputPower, averageConsumption })

  //   expect(
  //     fitness([
  //       { start: 0, activity: 1, duration: 60 },
  //       { start: 60, activity: -1, duration: 60 },
  //     ])
  //   ).toBe(-2)

  //   expect(
  //     fitness([
  //       { start: 0, activity: 1, duration: 90 },
  //       { start: 90, activity: -1, duration: 30 },
  //     ])
  //   ).toBe(-3)
  // })
})

describe('Fitness - fillInNormalPeriods', () => {
  test('should test fillInNormalPeriods empty', () => {
    expect(fillInNormalPeriods(300, [])).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 60, activity: 0 },
      { start: 120, duration: 60, activity: 0 },
      { start: 180, duration: 60, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })

  test('should test fillInNormalPeriods one activity', () => {
    expect(
      fillInNormalPeriods(300, [{ start: 0, duration: 300, activity: 1 }])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 1 },
      { start: 60, duration: 60, activity: 1 },
      { start: 120, duration: 60, activity: 1 },
      { start: 180, duration: 60, activity: 1 },
      { start: 240, duration: 60, activity: 1 },
    ])
  })

  test('should test fillInNormalPeriods one in the middle', () => {
    expect(
      fillInNormalPeriods(300, [{ start: 120, duration: 60, activity: 1 }])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 60, activity: 0 },
      { start: 120, duration: 60, activity: 1 },
      { start: 180, duration: 60, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })

  test('should test fillInNormalPeriods one long activity', () => {
    expect(
      fillInNormalPeriods(300, [{ start: 100, duration: 100, activity: 1 }])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 40, activity: 0 },
      { start: 100, duration: 20, activity: 1 },
      { start: 120, duration: 60, activity: 1 },
      { start: 180, duration: 20, activity: 1 },
      { start: 200, duration: 40, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })

  test('should test fillInNormalPeriods two activities', () => {
    expect(
      fillInNormalPeriods(300, [
        { start: 70, activity: 1, duration: 80 },
        { start: 160, activity: -1, duration: 30 },
      ])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 10, activity: 0 },
      { start: 70, duration: 50, activity: 1 },
      { start: 120, duration: 30, activity: 1 },
      { start: 150, duration: 10, activity: 0 },
      { start: 160, duration: 20, activity: -1 },
      { start: 180, duration: 10, activity: -1 },
      { start: 190, duration: 50, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })
})

describe('Fitness - calculateDischargeScore', () => {
  test('should discharge full hour, full battery', () => {
    expect(
      calculateDischargeScore({
        duration: 1,
        price: 2,
        averageConsumption: 1,
        currentCharge: 5,
      })
    ).toEqual([0, -1])
  })

  test('should discharge half hour, full battery', () => {
    expect(
      calculateDischargeScore({
        duration: 30 / 60,
        price: 2,
        averageConsumption: 1,
        currentCharge: 5,
      })
    ).toEqual([0, -0.5])
  })

  test('should discharge full hour, empty battery', () => {
    expect(
      calculateDischargeScore({
        duration: 1,
        price: 2,
        averageConsumption: 1,
        currentCharge: 0,
      })
    ).toEqual([2, -0])
  })

  test('should discharge full hour, almost empty battery', () => {
    expect(
      calculateDischargeScore({
        duration: 1,
        price: 2,
        averageConsumption: 1,
        currentCharge: 0.5,
      })
    ).toEqual([1, -0.5])
  })
})

describe('Fitness - calculateChargeScore', () => {
  test('should charge full hour, full battery', () => {
    expect(
      calculateChargeScore({
        duration: 1,
        price: 2,
        averageConsumption: 1,
        currentCharge: 5,
        batteryCapacity: 5,
        batteryMaxInputPower: 1,
      })
    ).toEqual([2, 0])
  })

  test('should charge half hour, full battery', () => {
    expect(
      calculateChargeScore({
        duration: 30 / 60,
        price: 2,
        averageConsumption: 1,
        currentCharge: 5,
        batteryCapacity: 5,
        batteryMaxInputPower: 1,
      })
    ).toEqual([1, 0])
  })

  test('should charge full hour, empty battery', () => {
    expect(
      calculateChargeScore({
        duration: 1,
        price: 2,
        averageConsumption: 1,
        currentCharge: 0,
        batteryCapacity: 5,
        batteryMaxInputPower: 1,
      })
    ).toEqual([4, 1])
  })

  test('should charge full hour, almost full battery', () => {
    expect(
      calculateChargeScore({
        duration: 1,
        price: 2,
        averageConsumption: 1,
        currentCharge: 4.5,
        batteryCapacity: 5,
        batteryMaxInputPower: 1,
      })
    ).toEqual([3, 0.5])
  })
})

describe('Fitness - calculateNormalScore', () => {
  test('should consume normal full hour', () => {
    expect(
      calculateNormalScore({
        duration: 1,
        price: 2,
        averageConsumption: 1,
      })
    ).toEqual([2, 0])
  })

  test('should consume normal half hour', () => {
    expect(
      calculateNormalScore({
        duration: 30 / 60,
        price: 2,
        averageConsumption: 1,
      })
    ).toEqual([1, 0])
  })
})

describe('Fitness', () => {
  test('should new fitness', () => {
    const priceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 1, start: '2022-12-01T01:00:00.000Z' },
    ]
    const totalDuration = 2 * 60
    const batteryMaxEnergy = 1
    const batteryMaxInputPower = 1
    const averageConsumption = 1
    const score = fitnessFunction({
      priceData,
      totalDuration,
      batteryMaxEnergy,
      batteryMaxInputPower,
      averageConsumption,
    })([
      { start: 30, duration: 60, activity: 1 },
      { start: 90, duration: 30, activity: -1 },
    ])
    console.log(score)
  })
})
