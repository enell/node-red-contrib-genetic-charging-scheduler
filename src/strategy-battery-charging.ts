import { NodeAPI, NodeDef, Node } from 'node-red';
import { calculateBatteryChargingStrategy } from './strategy-battery-charging-functions';
import z from 'zod';
import moment from 'moment';

const ValueShape = z.object({
  start: z.string(),
  value: z.number(),
});
const ImportShape = z.object({
  start: z.string(),
  importPrice: z.number(),
  exportPrice: z.number(),
});

const PayloadSchema = z.object({
  priceData: z
    .array(
      z.union([ValueShape, ImportShape]).transform((data) => ({
        start: moment(data.start).unix(),
        importPrice: 'importPrice' in data ? data.importPrice : data.value,
        exportPrice: 'exportPrice' in data ? (data.exportPrice ?? data.importPrice) : data.value,
      }))
    )
    .default([]),
  consumptionForecast: z
    .array(
      z
        .object({
          start: z.string(),
          value: z.number(),
        })
        .transform((data) => ({
          start: moment(data.start).unix(),
          value: data.value,
        }))
    )
    .optional()
    .default([]),
  productionForecast: z
    .array(
      z
        .object({
          start: z.string(),
          value: z.number(),
        })
        .transform((data) => ({
          start: moment(data.start).unix(),
          value: data.value,
        }))
    )
    .optional()
    .default([]),
  soc: z.number().min(0).max(100).optional().default(0),
  schedule: z
    .array(
      z.object({
        start: z.string(),
        activity: z.number(),
      })
    )
    .optional(),
  excessPvEnergyUse: z.number().optional(),
  cost: z.number().optional(),
  noBattery: z
    .object({
      schedule: z.array(
        z.object({
          start: z.string(),
          activity: z.number(),
        })
      ),
      excessPvEnergyUse: z.number().optional(),
      cost: z.number(),
    })
    .optional(),
});

export default (RED: NodeAPI) => {
  function StrategyBatteryChargingConstructor(
    this: Node,
    config: {
      populationSize: number;
      numberOfPricePeriods: number;
      generations: number;
      mutationRate: number;
      batteryMaxEnergy: number;
      batteryMaxInputPower: number;
      averageConsumption: number;
    } & NodeDef
  ) {
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
      const result = PayloadSchema.safeParse(msg.payload);
      if (!result.success) {
        msg.error = result.error;
        this.error('Invalid payload format', msg);
        done();
        return;
      }
      const payload = result.data;

      const priceData = payload.priceData;
      const consumptionForecast = payload.consumptionForecast;
      const productionForecast = payload.productionForecast;
      const soc = payload.soc;

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

      if (strategy && Object.keys(strategy).length > 0) {
        payload.schedule = strategy.best.schedule;
        payload.excessPvEnergyUse = strategy.best.excessPvEnergyUse;
        payload.cost = strategy.best.cost;
        payload.noBattery = {
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

  RED.nodes.registerType('enell-strategy-genetic-charging', StrategyBatteryChargingConstructor);
};
