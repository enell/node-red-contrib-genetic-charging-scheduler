const { expect, describe } = require('@jest/globals');
const { populationFunction } = require('../src/population');

describe('Population', () => {
  test('generate population of 1', () => {
    const population = populationFunction({
      totalDuration: 10,
      populationSize: 1,
      numberOfPricePeriods: 2,
    });
    expect(population[0].periods.head.data.start).toEqual(0);
    expect(
      population[0].periods.filter((data) => data.activity != 0).length
    ).toEqual(2);
  });
});
