import { geneticAlgorithmConstructor, Options } from './geneticalgorithm';
import {
  fitnessFunction,
  allPeriodsGenerator,
  allPeriods,
  cost,
  FitnessFunctionProps,
} from './fitness';
import { Activity, Phenotype, populationFunction, TimePeriod } from './population';
import { mutationFunction } from './mutation';
import { crossoverFunction } from './crossover';
import { DoublyLinkedList } from './schedule';
import moment from 'moment';

type Price = {
  start: number;
  importPrice: number;
  exportPrice: number;
};

type Value = {
  start: number;
  value: number;
};

export type Config = {
  priceData: (Price & Partial<Value>)[];
  consumptionForecast: Value[];
  productionForecast: Value[];
  populationSize: number;
  numberOfPricePeriods: number;
  generations: number;
  mutationRate: number;
  batteryMaxEnergy: number;
  batteryMaxOutputPower: number;
  batteryMaxInputPower: number;
  averageConsumption?: number;
  averageProduction?: number;
  excessPvEnergyUse: 0 | 1;
  soc: number;
};

const toSchedule = (
  props: FitnessFunctionProps,
  phenotype: Phenotype
): {
  start: string;
  activity: Activity;
  name: string;
  duration: number;
  cost: number;
  charge: number;
}[] => {
  const { input } = props;

  const activityToName = (activity: Activity) => {
    switch (activity) {
      case -1:
        return 'discharging';
      case 1:
        return 'charging';
      default:
        return 'idle';
    }
  };

  const schedule: {
    start: string;
    activity: Activity;
    name: string;
    duration: number;
    cost: number;
    charge: number;
  }[] = [];
  const periodStart = moment.unix(input[0].start);
  for (const period of allPeriodsGenerator(props, phenotype)) {
    if (period.duration != undefined && period.duration <= 0) {
      continue;
    }

    const lastPeriod = schedule.at(-1)!;
    if (lastPeriod && lastPeriod.activity === period.activity) {
      lastPeriod.duration += period.duration ?? 0;
      lastPeriod.cost += period.cost ?? 0;
      lastPeriod.charge += period.charge ?? 0;
    } else {
      schedule.push({
        start: periodStart.clone().add(period.start, 'm').toISOString(),
        activity: period.activity,
        name: activityToName(period.activity),
        duration: period.duration ?? 0,
        cost: period.cost ?? 0,
        charge: period.charge ?? 0,
      });
    }
  }

  return schedule;
};

const mergeInput = (config: Config) => {
  const {
    averageConsumption,
    averageProduction,
    priceData,
    consumptionForecast,
    productionForecast,
  } = config;

  const startOfHour = moment().startOf('hour').unix();
  return priceData
    .filter((v) => v.start >= startOfHour)
    .map((v) => {
      return {
        start: v.start,
        importPrice: v.importPrice ?? v.value,
        exportPrice: v.exportPrice ?? v.importPrice ?? v.value,
        consumption:
          consumptionForecast.find((c) => c.start === v.start)?.value ?? averageConsumption ?? 0,
        production:
          productionForecast.find((p) => p.start === v.start)?.value ?? averageProduction ?? 0,
      };
    });
};

export const calculateBatteryChargingStrategy = (config: Config) => {
  const { generations } = config;

  const input = mergeInput(config);
  if (input === undefined || input.length === 0) return;

  const props = {
    ...config,
    input,
    totalDuration: input.length * 60,
  };

  const options: Options<Phenotype> = {
    mutationFunction: mutationFunction(props),
    crossoverFunction: crossoverFunction(props),
    fitnessFunction: fitnessFunction(props),
    population: populationFunction(props),
  };

  const geneticAlgorithm = geneticAlgorithmConstructor(options);

  for (let i = 0; i < generations; i += 1) {
    geneticAlgorithm.evolve();
  }

  const best = geneticAlgorithm.best();
  const noBattery = {
    periods: new DoublyLinkedList<TimePeriod>().insertBack({
      start: 0,
      activity: 0,
    }),
    excessPvEnergyUse: 0,
  };
  return {
    best: {
      schedule: toSchedule(props, best),
      excessPvEnergyUse: best.excessPvEnergyUse,
      cost: cost(allPeriods(props, best)),
    },
    noBattery: {
      schedule: toSchedule(props, noBattery),
      excessPvEnergyUse: noBattery.excessPvEnergyUse,
      cost: cost(allPeriods(props, noBattery)),
    },
  };
};
