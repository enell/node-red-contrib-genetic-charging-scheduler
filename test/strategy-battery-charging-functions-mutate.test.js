const { mockRandomForEach } = require('jest-mock-random')
const { mutationFunction } = require('../src/strategy-battery-charging-functions')

describe('Mutation', () => {
  mockRandomForEach(0.4)

  test('should mutate', () => {
    const mutate = mutationFunction(120, 1)

    const p = mutate([
      { start: 0, activity: 1, duration: 10 },
      { start: 90, activity: -1, duration: 10 },
    ])

    expect(p).toMatchObject([
      { start: 0, activity: -1, duration: 4 },
      { start: 84, activity: 1, duration: 10 },
    ])
  })
})
