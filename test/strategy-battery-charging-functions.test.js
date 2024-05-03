const { expect, describe, it, afterEach } = require('@jest/globals');
const {
  calculateBatteryChargingStrategy,
} = require('../src/strategy-battery-charging-functions');

const moment = require('moment');

afterEach(() => {
  jest.restoreAllMocks();
});

let seed = 1;
const random = () => {
  if (seed == Infinity) seed = 1;
  const x = seed / Math.PI;
  seed++;
  return x - Math.floor(x);
};

describe('Calculate', () => {
  test('calculate', () => {
    jest.spyOn(Math, 'random').mockImplementation(random);
    let now = Date.now();
    now = now - (now % (60 * 60 * 1000));
    const priceData = [
      { importPrice: 1, exportPrice: 0, start: new Date(now).toString() },
      {
        importPrice: 500,
        exportPrice: 0,
        start: new Date(now + 60 * 60 * 1000).toString(),
      },
      {
        importPrice: 500,
        exportPrice: 0,
        start: new Date(now + 60 * 60 * 1000 * 2).toString(),
      },
    ];
    const productionForecast = priceData.map((v) => {
      return { start: v.start, value: 0 };
    });
    const consumptionForecast = priceData.map((v) => {
      return { start: v.start, value: 1.5 };
    });
    const populationSize = 100;
    const numberOfPricePeriods = 2;
    const generations = 500;
    const mutationRate = 0.03;

    const batteryMaxEnergy = 3; // kWh
    const batteryMaxOutputPower = 3; // kW
    const batteryMaxInputPower = 3; // kW
    const averageConsumption = 1.5; // kW
    const averageProduction = 0; // kW
    const soc = 0;
    const excessPvEnergyUse = 0;

    const config = {
      priceData,
      populationSize,
      numberOfPricePeriods,
      generations,
      mutationRate,
      batteryMaxEnergy,
      batteryMaxOutputPower,
      batteryMaxInputPower,
      averageConsumption,
      averageProduction,
      productionForecast,
      consumptionForecast,
      soc,
      excessPvEnergyUse,
    };
    const strategy = calculateBatteryChargingStrategy(config);
    const bestSchedule = strategy.best.schedule;

    expect(bestSchedule.length).toEqual(2);
    expect(bestSchedule[0]).toMatchObject({
      activity: 1,
    });
    expect(bestSchedule[1]).toMatchObject({
      activity: -1,
      name: 'discharging',
    });

    const noBatterySchedule = strategy.noBattery.schedule;
    expect(noBatterySchedule.length).toEqual(1);

    expect(strategy.best.excessPvEnergyUse).toEqual(excessPvEnergyUse);
    expect(strategy.best.cost).not.toBeNull();
    expect(strategy.best.cost).not.toBeNaN();
    expect(strategy.best.noBattery).not.toBeNull();
    expect(strategy.best.noBattery).not.toBeNaN();

    console.log(`best: ${strategy.best.cost}`);
    console.log(`no battery: ${strategy.noBattery.cost}`);

    const values = bestSchedule
      .filter((e) => e.activity != 0)
      .reduce((total, e) => {
        const toTimeString = (date) => {
          const HH = date.getHours().toString().padStart(2, '0');
          const mm = date.getMinutes().toString().padStart(2, '0');
          return `${HH}:${mm}`;
        };

        const touPattern = (start, end, charge) => {
          let pattern = toTimeString(start);
          pattern += '-';
          pattern += toTimeString(end);
          pattern += '/';
          pattern += start.getDay();
          pattern += '/';
          pattern += charge;
          return pattern;
        };

        const startDate = new Date(e.start);
        const endDate = new Date(
          startDate.getTime() + (e.duration - 1) * 60000
        );
        const charge = e.activity == 1 ? '+' : '-';
        if (startDate.getDay() == endDate.getDay()) {
          total.push(touPattern(startDate, endDate, charge));
        } else {
          const endDateDay1 = new Date(startDate);
          endDateDay1.setHours(23);
          endDateDay1.setMinutes(59);
          total.push(touPattern(startDate, endDateDay1, charge));

          const startDateDay2 = new Date(endDate);
          startDateDay2.setHours(0);
          startDateDay2.setMinutes(0);
          total.push(touPattern(startDateDay2, endDate, charge));
        }
        return total;
      }, []);
  });

  test('calculate overlapping', () => {
    const payload = require('./payload.json');
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date(payload.priceData[0].start));

    const populationSize = 300;
    const numberOfPricePeriods = 50;
    const generations = 600;
    const mutationRate = 0.03;

    const batteryMaxEnergy = 5; // kWh
    const batteryMaxOutputPower = 2.5; // kW
    const batteryMaxInputPower = 2.5; // kW
    const excessPvEnergyUse = 0;

    const config = {
      priceData: payload.priceData,
      populationSize,
      numberOfPricePeriods,
      generations,
      mutationRate,
      batteryMaxEnergy,
      batteryMaxOutputPower,
      batteryMaxInputPower,
      productionForecast: payload.productionForecast,
      consumptionForecast: payload.consumptionForecast,
      soc: payload.soc,
      excessPvEnergyUse,
    };
    const strategy = calculateBatteryChargingStrategy(config);

    const startTime = (interval) => moment(interval.start);
    const endTime = (interval) =>
      moment(interval.start).add(interval.duration, 's');

    for (let i = 1; i < strategy.best.schedule.length; i++) {
      expect(endTime(strategy.best.schedule[i] - 1).unix()).toBeLessThan(
        startTime(strategy.best.schedule[i]).unix()
      );
    }
  });
});
