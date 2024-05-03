const geneticAlgorithmConstructor = require('./geneticalgorithm');
const {
  fitnessFunction,
  allPeriodsGenerator,
  allPeriods,
  cost,
} = require('./fitness');
const { populationFunction } = require('./population');
const { mutationFunction } = require('./mutation');
const { crossoverFunction } = require('./crossover');
const { DoublyLinkedList } = require('./schedule');

const toSchedule = (props, phenotype) => {
  const { input } = props;
  const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
  };

  const activityToName = (activity) => {
    switch (activity) {
      case -1:
        return 'discharging';
      case 1:
        return 'charging';
      default:
        return 'idle';
    }
  };

  const schedule = [];
  const periodStart = new Date(input[0].start);
  for (const period of allPeriodsGenerator(props, phenotype)) {
    if (period.duration <= 0) {
      continue;
    }

    if (schedule.length && period.activity == schedule.at(-1).activity) {
      schedule.at(-1).duration += period.duration;
      schedule.at(-1).cost += period.cost;
      schedule.at(-1).charge += period.charge;
    } else {
      schedule.push({
        start: addMinutes(periodStart, period.start),
        activity: period.activity,
        name: activityToName(period.activity),
        duration: period.duration,
        cost: period.cost,
        charge: period.charge,
      });
    }
  }

  return schedule;
};

const mergeInput = (config) => {
  const {
    averageConsumption,
    averageProduction,
    priceData,
    consumptionForecast,
    productionForecast,
  } = config;

  let now = Date.now();
  now = new Date(now - (now % (60 * 60 * 1000)));
  return priceData
    .filter((v) => new Date(v.start).getTime() >= now.getTime())
    .map((v) => {
      return {
        start: new Date(v.start),
        importPrice: v.importPrice ?? v.value,
        exportPrice: v.exportPrice ?? v.importPrice ?? v.value,
        consumption:
          consumptionForecast.find(
            (c) => new Date(c.start).getTime() === new Date(v.start).getTime()
          )?.value ??
          averageConsumption ??
          0,
        production:
          productionForecast.find(
            (p) => new Date(p.start).getTime() === new Date(v.start).getTime()
          )?.value ??
          averageProduction ??
          0,
      };
    });
};

const calculateBatteryChargingStrategy = (config) => {
  const { generations } = config;

  const input = mergeInput(config);
  if (input === undefined || input.length === 0) return {};

  const props = {
    ...config,
    input,
    totalDuration: input.length * 60,
  };

  const options = {
    mutationFunction: mutationFunction(props),
    crossoverFunction: crossoverFunction(props),
    fitnessFunction: fitnessFunction(props),
    population: populationFunction(props),
  };

  const geneticAlgorithm = geneticAlgorithmConstructor(options);

  for (let i = 0; i < generations; i += 1) {
    geneticAlgorithm.evolve();
  }

  const p = geneticAlgorithm.population();

  const best = geneticAlgorithm.best();
  const noBattery = {
    periods: new DoublyLinkedList().insertBack({ start: 0, activity: 0 }),
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

module.exports = {
  fitnessFunction,
  calculateBatteryChargingStrategy,
};
