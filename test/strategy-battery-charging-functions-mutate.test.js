import { mockRandomForEach } from 'jest-mock-random'
import { mutationFunction } from '../src/strategy-battery-charging-functions'

describe('Mutation', () => {
  mockRandomForEach(0.4)

  test('should mutate', () => {
    const mutate = mutationFunction(120, 1)

    const p = mutate([
      { start: 0, activity: 1, duration: 10 },
      { start: 90, activity: -1, duration: 10 },
    ])

    expect(p).toMatchObject([
      { start: 0, activity: -1, duration: 0 },
      { start: 70, activity: 1, duration: 10 },
    ])
  })
})
