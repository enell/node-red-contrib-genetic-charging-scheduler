import { generateRandomActivity } from './utils';
import { DoublyLinkedList } from './schedule';

export type Activity = -1 | 0 | 1;

export type TimePeriod = {
  start: number;
  activity: Activity;
  cost?: number;
  charge?: number;
  duration?: number;
};

export type Phenotype = {
  periods: DoublyLinkedList<TimePeriod>;
  excessPvEnergyUse?: number;
};

export type Population = Phenotype[];

type PopulationFunctionProps = {
  totalDuration: number;
  populationSize: number;
  numberOfPricePeriods: number;
  excessPvEnergyUse?: number;
};

export const populationFunction = (props: PopulationFunctionProps): Population => {
  const { totalDuration, populationSize, numberOfPricePeriods, excessPvEnergyUse } = props;

  const population = [];
  for (let i = 0; i < populationSize; i += 1) {
    const timePeriods = new DoublyLinkedList<TimePeriod>();
    const activities: Activity[] = [];
    let currentNumberOfPricePeriods = 0;
    let previousActivity: Activity | undefined = undefined;
    while (currentNumberOfPricePeriods < numberOfPricePeriods) {
      const activity = generateRandomActivity(previousActivity);
      currentNumberOfPricePeriods += activity != 0 ? 1 : 0;
      activities.push(activity);
      previousActivity = activity;
    }

    const startTimes = new Set<number>();
    startTimes.add(0);
    while (startTimes.size < activities.length) {
      startTimes.add(Math.floor(Math.random() * totalDuration));
    }
    Array.from(startTimes)
      .sort((a, b) => a - b)
      .forEach((start, i) => timePeriods.insertBack({ start, activity: activities[i] }));

    population.push({
      periods: timePeriods,
      excessPvEnergyUse,
    });
  }
  return population;
};
