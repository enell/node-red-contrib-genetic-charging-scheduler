const { mockRandomForEach } = require('jest-mock-random')
const {
  mutationFunction,
} = require('../src/strategy-battery-charging-functions')

describe('Mutation', () => {
  mockRandomForEach(0.4)

  test('should mutate', () => {
    const mutate = mutationFunction({ totalDuration: 120, mutationRate: 1 })

    const p = mutate({
      periods: [
        { start: 0, activity: 1, duration: 10 },
        { start: 90, activity: -1, duration: 10 },
      ],
      excessPvEnergyUse: 0,
    })

    expect(p).toMatchObject({
      periods: [
        { start: 0, activity: -1, duration: 10 },
        { start: 85, activity: 1, duration: 10 },
      ],
      excessPvEnergyUse: 0,
    })
  })
})
