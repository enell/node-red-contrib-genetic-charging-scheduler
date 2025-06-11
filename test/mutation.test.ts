import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest';
import { mutationFunction } from '../src/mutation';
import { DoublyLinkedList } from '../src/schedule';
import { TimePeriod } from '../src/population';

describe('Mutation', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should mutate', () => {
    const mutate = mutationFunction({ totalDuration: 120, mutationRate: 1 });

    const periods = new DoublyLinkedList<TimePeriod>()
      .insertBack({ start: 0, activity: 1 })
      .insertBack({ start: 90, activity: -1 });

    const p = mutate({
      periods,
      excessPvEnergyUse: 0,
    });

    expect(p).toEqual({
      periods: new DoublyLinkedList()
        .insertBack({ start: 0, activity: -1 })
        .insertBack({ start: 85, activity: 0 }),
      excessPvEnergyUse: 0,
    });
  });
});
