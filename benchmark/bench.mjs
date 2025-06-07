import Benchmark from 'benchmark';
import { calculateBatteryChargingStrategy } from '../dist/strategy-battery-charging-functions.js';

const suit = new Benchmark.Suite();

suit
  .add('calculate schedule', () => {
    const priceData = [
      { value: 1, start: '2022-12-01T00:00:00.000Z' },
      { value: 2, start: '2022-12-01T01:00:00.000Z' },
      { value: 5, start: '2022-12-01T02:00:00.000Z' },
    ];
    const populationSize = 100;
    const numberOfPricePeriods = 8;
    const generations = 500;
    const mutationRate = 0.03;

    const batteryMaxEnergy = 5; //kWh
    const batteryMaxOutputPower = 2.5; //kW
    const batteryMaxInputPower = 2.5; //kW
    const averageConsumption = 1.5; // kW

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
    };
    calculateBatteryChargingStrategy(config);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .run();
