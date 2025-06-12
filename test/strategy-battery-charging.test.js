import { describe, it, expect, afterEach, vi } from 'vitest';
import node from '../src/strategy-battery-charging';
import helper from 'node-red-node-test-helper';
import moment from 'moment';

describe('Battery charging strategy Node', () => {
  afterEach(() => {
    helper.unload();
  });

  it('should be loaded', async () => {
    const flow = [
      {
        id: 'n1',
        type: 'enell-strategy-genetic-charging',
        name: 'test name',
      },
    ];

    await new Promise((resolve) => {
      helper.load(node, flow, function callback() {
        const n1 = helper.getNode('n1');
        expect(n1.name).toBe('test name');
        resolve();
      });
    });
  });

  it('should send schedule in payload', async () => {
    const { default: payload } = await import('./payload.json', {
      assert: { type: 'json' },
    });

    vi.spyOn(Date, 'now').mockReturnValue(new Date(payload.priceData[0].start).getTime());

    const flow = [
      {
        id: 'n1',
        type: 'enell-strategy-genetic-charging',
        name: 'test name',
        populationSize: 10,
        numberOfPricePeriods: 3,
        generations: 10,
        mutationRate: 3,
        batteryMaxEnergy: 5,
        batteryMaxInputPower: 2.5,
        averageConsumption: 1.5,
        wires: [['n2']],
      },
      { id: 'n2', type: 'helper' },
    ];

    await new Promise((resolve, reject) => {
      helper.load(node, flow, function callback() {
        const n2 = helper.getNode('n2');
        const n1 = helper.getNode('n1');
        n2.on('input', function inputCallback(msg) {
          try {
            expect(msg).toHaveProperty('payload');
            expect(msg.payload).toHaveProperty('schedule');

            const scheduleDuration = msg.payload.schedule.reduce(
              (acc, period) => period.duration + acc,
              0
            );
            const priceDataDuration = payload.priceData.length * 60;
            expect(scheduleDuration).toBe(priceDataDuration);

            expect(moment(msg.payload.schedule[0].start).toISOString()).toEqual(
              moment(payload.priceData[0].start).toISOString()
            );

            expect(
              moment(msg.payload.schedule.at(-1).start)
                .add(msg.payload.schedule.at(-1).duration, 'minute')
                .toISOString()
            ).toEqual(moment(payload.priceData.at(-1).start).add(1, 'h').toISOString());
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        n1.on('call:error', (call) => {
          reject(call.args[0]);
        });

        n1.receive({ payload });
      });
    });
  });

  it('should calculate schedule with old input', async () => {
    const flow = [
      {
        id: 'n1',
        type: 'enell-strategy-genetic-charging',
        name: 'test name',
        populationSize: 10,
        numberOfPricePeriods: 3,
        generations: 10,
        mutationRate: 3,
        batteryMaxEnergy: 5,
        batteryMaxInputPower: 2.5,
        averageConsumption: 1.5,
        wires: [['n2']],
      },
      { id: 'n2', type: 'helper' },
    ];

    await new Promise((resolve, reject) => {
      helper.load(node, flow, function callback() {
        const now = moment().startOf('hour');
        const inputPayload = {
          soc: '75',
          priceData: [
            2.1419, 1.9709, 1.8481, 1.7586, 2.0838, 2.143, 2.4856, 2.8673, 3.1644, 2.847, 2.513,
            2.0868, 2.066, 1.9902, 2.1663, 2.5038, 2.7555, 3.2038, 3.5277, 3.2972, 2.8811, 2.7304,
            2.357, 1.7825,
          ].map((price, index) => ({
            start: now.clone().add(index, 'h').toISOString(),
            value: price,
          })),
        };

        const n2 = helper.getNode('n2');
        const n1 = helper.getNode('n1');
        n2.on('input', function inputCallback(msg) {
          expect(msg).toHaveProperty('payload');
          expect(msg.payload).toHaveProperty('schedule');

          const scheduleDuration = msg.payload.schedule.reduce(
            (acc, period) => period.duration + acc,
            0
          );
          const priceDataDuration = inputPayload.priceData.length * 60;
          expect(scheduleDuration).toBe(priceDataDuration);

          console.log(JSON.stringify(msg.payload, null, 1));
          resolve();
        });

        n1.on('call:error', (call) => {
          reject(call.args[0]);
        });

        n1.receive({ payload: inputPayload });
      });
    });
  });

  it('should handle empty priceData', async () => {
    const flow = [
      {
        id: 'n1',
        type: 'enell-strategy-genetic-charging',
        name: 'test name',
        wires: [['n2']],
      },
      { id: 'n2', type: 'helper' },
    ];

    await new Promise((resolve) => {
      helper.load(node, flow, function callback() {
        const n1 = helper.getNode('n1');

        n1.on('call:error', (call) => {
          const error = call.args[1].error;
          expect(error).toBeDefined();
          resolve();
        });

        n1.receive({ payload: {} });
        n1.receive({});
      });
    });
  });
});
