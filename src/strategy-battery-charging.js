import { calculateBatteryChargingStrategy } from './strategy-battery-charging-functions';

export default (RED) => {
  function StrategyBatteryChargingConstructor(config) {
    RED.nodes.createNode(this, config);

    const {
      populationSize,
      numberOfPricePeriods,
      generations,
      mutationRate,
      batteryMaxEnergy,
      batteryMaxInputPower,
      averageConsumption,
    } = config;

    this.on('input', (msg, send, done) => {
      const priceData = msg.payload?.priceData ?? [];
      const consumptionForecast = msg.payload?.consumptionForecast ?? [];
      const productionForecast = msg.payload?.productionForecast ?? [];
      const soc = msg.payload?.soc;

      const strategy = calculateBatteryChargingStrategy({
        priceData,
        consumptionForecast,
        productionForecast,
        populationSize,
        numberOfPricePeriods,
        generations,
        mutationRate: mutationRate / 100,
        batteryMaxEnergy,
        batteryMaxOutputPower: batteryMaxInputPower,
        batteryMaxInputPower,
        averageConsumption,
        excessPvEnergyUse: 0, // 0=Fed to grid, 1=Charge
        soc: soc / 100,
      });

      const payload = msg.payload ?? {};

      if (strategy && Object.keys(strategy).length > 0) {
        msg.payload.schedule = strategy.best.schedule;
        msg.payload.excessPvEnergyUse = strategy.best.excessPvEnergyUse;
        msg.payload.cost = strategy.best.cost;
        msg.payload.noBattery = {
          schedule: strategy.noBattery.schedule,
          excessPvEnergyUse: strategy.noBattery.excessPvEnergyUse,
          cost: strategy.noBattery.cost,
        };
      }
      msg.payload = payload;

      send(msg);
      done();
    });
  }

  RED.nodes.registerType(
    'enell-strategy-genetic-charging',
    StrategyBatteryChargingConstructor
  );
};
