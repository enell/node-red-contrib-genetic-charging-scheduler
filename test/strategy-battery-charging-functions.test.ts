import { describe, expect, test, afterEach, vi } from 'vitest';
import {
  calculateBatteryChargingStrategy,
  Config,
} from '../src/strategy-battery-charging-functions';
import moment from 'moment';

afterEach(() => {
  vi.restoreAllMocks();
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
    vi.spyOn(Math, 'random').mockImplementation(random);
    const n = moment().add(1, 'h').startOf('hour');
    const priceData = [
      { importPrice: 1, exportPrice: 0, start: n.unix() },
      {
        importPrice: 500,
        exportPrice: 0,
        start: n.clone().add(1, 'h').unix(),
      },
      {
        importPrice: 500,
        exportPrice: 0,
        start: n.clone().add(2, 'h').unix(),
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
    const batteryIdleLoss = 0; // kWh/h

    const config: Config = {
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
      batteryIdleLoss,
    };
    const strategy = calculateBatteryChargingStrategy(config);
    const bestSchedule = strategy!.best.schedule;

    expect(bestSchedule.length).toEqual(2);
    expect(bestSchedule[0]).toMatchObject({
      activity: 1,
    });
    expect(bestSchedule[1]).toMatchObject({
      activity: -1,
      name: 'discharging',
    });

    const noBatterySchedule = strategy!.noBattery.schedule;
    expect(noBatterySchedule.length).toEqual(1);

    expect(strategy!.best.excessPvEnergyUse).toEqual(excessPvEnergyUse);
    expect(strategy!.best.cost).not.toBeNull();
    expect(strategy!.best.cost).not.toBeNaN();
    expect(strategy!.noBattery).not.toBeNull();
    expect(strategy!.noBattery).not.toBeNaN();

    console.log(`best: ${strategy!.best.cost}`);
    console.log(`no battery: ${strategy!.noBattery.cost}`);

    const values = bestSchedule
      .filter((e) => e.activity != 0)
      .reduce((total, e) => {
        const touPattern = (start, end, charge) => {
          let pattern = start.format('HH:mm');
          pattern += '-';
          pattern += end.format('HH:mm');
          pattern += '/';
          pattern += start.day();
          pattern += '/';
          pattern += charge;
          return pattern;
        };

        const startDate = moment(e.start);
        const endDate = startDate.clone().add(e.duration - 1, 'm');
        const charge = e.activity == 1 ? '+' : '-';
        if (startDate.day() === endDate.day()) {
          total.push(touPattern(startDate, endDate, charge));
        } else {
          const endDateDay1 = moment(startDate);
          endDateDay1.hours(23);
          endDateDay1.minutes(59);
          total.push(touPattern(startDate, endDateDay1, charge));

          const startDateDay2 = moment(endDate);
          startDateDay2.hours(0);
          startDateDay2.minutes(0);
          total.push(touPattern(startDateDay2, endDate, charge));
        }
        return total;
      }, [] as string[]);
    expect(values).toBeDefined();
  });
});
