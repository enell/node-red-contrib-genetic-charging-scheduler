import { describe, test, vi, expect } from 'vitest';
import { crossoverFunction } from '../src/crossover';
import { DoublyLinkedList } from '../src/schedule';

describe('Crossover', () => {
  test('should perform a crossover', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const crossover = crossoverFunction({ totalDuration: 120 });

    const p = crossover(
      {
        periods: new DoublyLinkedList()
          .insertBack({ start: 0, activity: 1 })
          .insertBack({ start: 70, activity: -1 }),
        excessPvEnergyUse: 0,
      },
      {
        periods: new DoublyLinkedList()
          .insertBack({ start: 50, activity: 1 })
          .insertBack({ start: 80, activity: -1 }),
        excessPvEnergyUse: 0,
      }
    )[0];
    expect(p).toEqual({
      periods: new DoublyLinkedList()
        .insertBack({ start: 0, activity: 1 })
        .insertBack({ start: 80, activity: -1 }),
      excessPvEnergyUse: 0,
    });
  });

  test('should perform a crossover where periods are equal to midpoint', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const crossover = crossoverFunction({ totalDuration: 120 });

    const p = crossover(
      {
        periods: new DoublyLinkedList()
          .insertBack({ start: 0, activity: 1 })
          .insertBack({ start: 60, activity: -1 }),
        excessPvEnergyUse: 0,
      },
      {
        periods: new DoublyLinkedList()
          .insertBack({ start: 60, activity: 1 })
          .insertBack({ start: 80, activity: -1 }),
        excessPvEnergyUse: 0,
      }
    )[0];
    expect(p).toEqual({
      periods: new DoublyLinkedList()
        .insertBack({ start: 0, activity: 1 })
        .insertBack({ start: 60, activity: -1 })
        .insertBack({ start: 80, activity: -1 }),
      excessPvEnergyUse: 0,
    });
  });
});
