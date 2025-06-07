import { describe, it, expect, afterEach } from 'vitest';
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
          expect(msg).toHaveProperty('payload');
          expect(msg.payload).toHaveProperty('schedule');
          resolve();
        });

        n1.on('call:error', (call) => {
          reject(call.args[0]);
        });

        const now = moment().startOf('hour');
        const inputPayload = {
          payload: {
            priceData: [
              {
                value: 1,
                start: now.clone().add(0, 'h').toISOString(),
              },
              {
                value: 2,
                start: now.clone().add(1, 'h').toISOString(),
              },
              {
                value: 5,
                start: now.clone().add(2, 'h').toISOString(),
              },
            ],
          },
        };

        n1.receive(inputPayload);
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
        const n2 = helper.getNode('n2');
        const n1 = helper.getNode('n1');
        n2.on('input', function inputCallback(msg) {
          expect(msg).toHaveProperty('payload');
          expect(msg.payload).toHaveProperty('schedule');

          console.log(JSON.stringify(msg.payload, null, 1));
          resolve();
        });

        n1.on('call:error', (call) => {
          reject(call.args[0]);
        });

        const now = moment().startOf('hour');
        const inputPayload = {
          soc: 75,
          priceData: [
            {
              value: 2.1419,
              start: now.clone().add(0, 'h').toISOString(),
            },
            {
              value: 1.9709,
              start: now.clone().add(1, 'h').toISOString(),
            },
            {
              value: 1.8481,
              start: now.clone().add(2, 'h').toISOString(),
            },
            {
              value: 1.7586,
              start: now.clone().add(3, 'h').toISOString(),
            },
            {
              value: 2.0838,
              start: now.clone().add(4, 'h').toISOString(),
            },
            {
              value: 2.143,
              start: now.clone().add(5, 'h').toISOString(),
            },
            {
              value: 2.4856,
              start: now.clone().add(6, 'h').toISOString(),
            },
            {
              value: 2.8673,
              start: now.clone().add(7, 'h').toISOString(),
            },
            {
              value: 3.1644,
              start: now.clone().add(8, 'h').toISOString(),
            },
            {
              value: 2.847,
              start: now.clone().add(9, 'h').toISOString(),
            },
            {
              value: 2.513,
              start: now.clone().add(10, 'h').toISOString(),
            },
            {
              value: 2.0868,
              start: now.clone().add(11, 'h').toISOString(),
            },
            {
              value: 2.066,
              start: now.clone().add(12, 'h').toISOString(),
            },
            {
              value: 1.9902,
              start: now.clone().add(13, 'h').toISOString(),
            },
            {
              value: 2.1663,
              start: now.clone().add(14, 'h').toISOString(),
            },
            {
              value: 2.5038,
              start: now.clone().add(15, 'h').toISOString(),
            },
            {
              value: 2.7555,
              start: now.clone().add(16, 'h').toISOString(),
            },
            {
              value: 3.2038,
              start: now.clone().add(17, 'h').toISOString(),
            },
            {
              value: 3.5277,
              start: now.clone().add(18, 'h').toISOString(),
            },
            {
              value: 3.2972,
              start: now.clone().add(19, 'h').toISOString(),
            },
            {
              value: 2.8811,
              start: now.clone().add(20, 'h').toISOString(),
            },
            {
              value: 2.7304,
              start: now.clone().add(21, 'h').toISOString(),
            },
            {
              value: 2.357,
              start: now.clone().add(22, 'h').toISOString(),
            },
            {
              value: 1.7825,
              start: now.clone().add(23, 'h').toISOString(),
            },
          ],
        };

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
