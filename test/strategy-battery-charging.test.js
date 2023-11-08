const node = require('../src/strategy-battery-charging')
const helper = require('node-red-node-test-helper')

describe('Battery charging strategy Node', () => {
  afterEach(() => {
    helper.unload()
  })

  it('should be loaded', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
      },
    ]

    helper.load(node, flow, function callback() {
      const n1 = helper.getNode('n1')
      expect(n1.name).toBe('test name')
      done()
    })
  })

  it('should send schedule in payload', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
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
    ]
    helper.load(node, flow, function callback() {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback(msg) {
        expect(msg).toHaveProperty('payload')
        expect(msg.payload).toHaveProperty('schedule')
        done()
      })

      let now = Date.now()
      now = now - (now % (60 * 60 * 1000))
      const inputPayload = {
        payload: {
          priceData: [
            {
              value: 1,
              start: new Date(now + 60 * 60 * 1000 * 0).toString(),
            },
            {
              value: 2,
              start: new Date(now + 60 * 60 * 1000 * 1).toString(),
            },
            {
              value: 5,
              start: new Date(now + 60 * 60 * 1000 * 2).toString(),
            },
          ],
        },
      }

      n1.receive(inputPayload)
    })
  })

  it('should calculate schedule with old input', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
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
    ]
    helper.load(node, flow, function callback() {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback(msg) {
        expect(msg).toHaveProperty('payload')
        expect(msg.payload).toHaveProperty('schedule')

        console.log(JSON.stringify(msg.payload, null, 1))
        done()
      })

      let now = Date.now()
      now = now - (now % (24 * 60 * 60 * 1000))
      const inputPayload = {
        soc: 75,
        priceData: [
          {
            value: 2.1419,
            start: new Date(now + 60 * 60 * 1000 * 0).toString(),
          },
          {
            value: 1.9709,
            start: new Date(now + 60 * 60 * 1000 * 1).toString(),
          },
          {
            value: 1.8481,
            start: new Date(now + 60 * 60 * 1000 * 2).toString(),
          },
          {
            value: 1.7586,
            start: new Date(now + 60 * 60 * 1000 * 3).toString(),
          },
          {
            value: 2.0838,
            start: new Date(now + 60 * 60 * 1000 * 4).toString(),
          },
          {
            value: 2.143,
            start: new Date(now + 60 * 60 * 1000 * 5).toString(),
          },
          {
            value: 2.4856,
            start: new Date(now + 60 * 60 * 1000 * 6).toString(),
          },
          {
            value: 2.8673,
            start: new Date(now + 60 * 60 * 1000 * 7).toString(),
          },
          {
            value: 3.1644,
            start: new Date(now + 60 * 60 * 1000 * 8).toString(),
          },
          {
            value: 2.847,
            start: new Date(now + 60 * 60 * 1000 * 9).toString(),
          },
          {
            value: 2.513,
            start: new Date(now + 60 * 60 * 1000 * 10).toString(),
          },
          {
            value: 2.0868,
            start: new Date(now + 60 * 60 * 1000 * 11).toString(),
          },
          {
            value: 2.066,
            start: new Date(now + 60 * 60 * 1000 * 12).toString(),
          },
          {
            value: 1.9902,
            start: new Date(now + 60 * 60 * 1000 * 13).toString(),
          },
          {
            value: 2.1663,
            start: new Date(now + 60 * 60 * 1000 * 14).toString(),
          },
          {
            value: 2.5038,
            start: new Date(now + 60 * 60 * 1000 * 15).toString(),
          },
          {
            value: 2.7555,
            start: new Date(now + 60 * 60 * 1000 * 16).toString(),
          },
          {
            value: 3.2038,
            start: new Date(now + 60 * 60 * 1000 * 17).toString(),
          },
          {
            value: 3.5277,
            start: new Date(now + 60 * 60 * 1000 * 18).toString(),
          },
          {
            value: 3.2972,
            start: new Date(now + 60 * 60 * 1000 * 19).toString(),
          },
          {
            value: 2.8811,
            start: new Date(now + 60 * 60 * 1000 * 20).toString(),
          },
          {
            value: 2.7304,
            start: new Date(now + 60 * 60 * 1000 * 21).toString(),
          },
          {
            value: 2.357,
            start: new Date(now + 60 * 60 * 1000 * 22).toString(),
          },
          {
            value: 1.7825,
            start: new Date(now + 60 * 60 * 1000 * 23).toString(),
          },
        ],
      }

      n1.receive({ payload: inputPayload })
    })
  })

  it('should send handle empty priceData', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        wires: [['n2']],
      },
      { id: 'n2', type: 'helper' },
    ]
    helper.load(node, flow, function callback() {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback(msg) {
        expect(msg).toHaveProperty('payload')
        done()
      })

      n1.receive({ payload: {} })
      n1.receive({})
    })
  })

  xit('uses forecasted solar data, consumption data and price data', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        populationSize: 10,
        numberOfPricePeriods: 12,
        generations: 10,
        mutationRate: 3,
        batteryMaxEnergy: 14,
        batteryMaxInputPower: 3.2,
        batteryMaxOutputPower: 3.5,
        averageConsumption: 1,
        wires: [['n2']],
      },
      { id: 'n2', type: 'helper' },
    ]
    helper.load(node, flow, function callback() {
      const n2 = helper.getNode('n2')
      const n1 = helper.getNode('n1')
      n2.on('input', function inputCallback(msg) {
        expect(msg).toHaveProperty('payload')
        expect(msg.payload).toHaveProperty('schedule')

        console.log(JSON.stringify(msg.payload, null, 1))
        done()
      })

      let now = Date.now()
      now = now - (now % (24 * 60 * 60 * 1000))

      const inputPayload = {
        consumptionForecast: [
          { start: '2023-11-06T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-07T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-07T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-07T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-07T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-07T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-07T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-07T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-07T07:00:00.000Z', value: 1 },
          { start: '2023-11-07T08:00:00.000Z', value: 1 },
          { start: '2023-11-07T09:00:00.000Z', value: 1 },
          { start: '2023-11-07T10:00:00.000Z', value: 2 },
          { start: '2023-11-07T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-07T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-07T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-07T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-07T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-07T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-07T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-07T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-07T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-07T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-07T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-07T22:00:00.000Z', value: 0.35 },
          { start: '2023-11-07T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-08T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-08T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-08T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-08T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-08T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-08T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-08T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-08T07:00:00.000Z', value: 1 },
          { start: '2023-11-08T08:00:00.000Z', value: 1 },
          { start: '2023-11-08T09:00:00.000Z', value: 1 },
          { start: '2023-11-08T10:00:00.000Z', value: 2 },
          { start: '2023-11-08T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-08T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-08T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-08T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-08T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-08T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-08T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-08T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-08T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-08T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-08T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-08T22:00:00.000Z', value: 0.35 },
        ],
        productionForecast: [
          { start: '2023-11-06T20:00:00.000Z', value: 0 },
          { start: '2023-11-06T21:00:00.000Z', value: 0 },
          { start: '2023-11-06T22:00:00.000Z', value: 0 },
          { start: '2023-11-06T23:00:00.000Z', value: 0 },
          { start: '2023-11-07T00:00:00.000Z', value: 0 },
          { start: '2023-11-07T01:00:00.000Z', value: 0 },
          { start: '2023-11-07T02:00:00.000Z', value: 0 },
          { start: '2023-11-07T03:00:00.000Z', value: 0 },
          { start: '2023-11-07T04:00:00.000Z', value: 0 },
          { start: '2023-11-07T05:00:00.000Z', value: 0 },
          { start: '2023-11-07T06:00:00.000Z', value: 0.037584765924899996 },
          { start: '2023-11-07T07:00:00.000Z', value: 1.0352124637008 },
          { start: '2023-11-07T08:00:00.000Z', value: 0.8656531374844 },
          { start: '2023-11-07T09:00:00.000Z', value: 1.1075649573832 },
          { start: '2023-11-07T10:00:00.000Z', value: 1.080462944374 },
          { start: '2023-11-07T11:00:00.000Z', value: 1.2233053666803 },
          { start: '2023-11-07T12:00:00.000Z', value: 1.6289958714418 },
          { start: '2023-11-07T13:00:00.000Z', value: 1.4144140878727 },
          { start: '2023-11-07T14:00:00.000Z', value: 1.6047951676180001 },
          { start: '2023-11-07T15:00:00.000Z', value: 0.1140376281163 },
          { start: '2023-11-07T16:00:00.000Z', value: 0 },
          { start: '2023-11-07T17:00:00.000Z', value: 0 },
          { start: '2023-11-07T18:00:00.000Z', value: 0 },
          { start: '2023-11-07T19:00:00.000Z', value: 0 },
          { start: '2023-11-07T20:00:00.000Z', value: 0 },
          { start: '2023-11-07T21:00:00.000Z', value: 0 },
          { start: '2023-11-07T22:00:00.000Z', value: 0 },
          { start: '2023-11-07T23:00:00.000Z', value: 0 },
          { start: '2023-11-08T00:00:00.000Z', value: 0 },
          { start: '2023-11-08T01:00:00.000Z', value: 0 },
          { start: '2023-11-08T02:00:00.000Z', value: 0 },
          { start: '2023-11-08T03:00:00.000Z', value: 0 },
          { start: '2023-11-08T04:00:00.000Z', value: 0 },
          { start: '2023-11-08T05:00:00.000Z', value: 0 },
          { start: '2023-11-08T06:00:00.000Z', value: 0 },
          { start: '2023-11-08T07:00:00.000Z', value: 0.5909194783453999 },
          { start: '2023-11-08T08:00:00.000Z', value: 0.9641654103375 },
          { start: '2023-11-08T09:00:00.000Z', value: 1.2375390413275 },
          { start: '2023-11-08T10:00:00.000Z', value: 2.2937554866161998 },
          { start: '2023-11-08T11:00:00.000Z', value: 2.6904276996809 },
          { start: '2023-11-08T12:00:00.000Z', value: 2.5391116667234 },
          { start: '2023-11-08T13:00:00.000Z', value: 2.4753785472894 },
          { start: '2023-11-08T14:00:00.000Z', value: 1.8982417325204999 },
          { start: '2023-11-08T15:00:00.000Z', value: 0.4602997342469 },
          { start: '2023-11-08T16:00:00.000Z', value: 0 },
          { start: '2023-11-08T17:00:00.000Z', value: 0 },
          { start: '2023-11-08T18:00:00.000Z', value: 0 },
          { start: '2023-11-08T19:00:00.000Z', value: 0 },
          { start: '2023-11-08T20:00:00.000Z', value: 0 },
          { start: '2023-11-08T21:00:00.000Z', value: 0 },
          { start: '2023-11-08T22:00:00.000Z', value: 0 },
          { start: '2023-11-08T23:00:00.000Z', value: 0 },
          { start: '2023-11-09T00:00:00.000Z', value: 0 },
          { start: '2023-11-09T01:00:00.000Z', value: 0 },
          { start: '2023-11-09T02:00:00.000Z', value: 0 },
          { start: '2023-11-09T03:00:00.000Z', value: 0 },
          { start: '2023-11-09T04:00:00.000Z', value: 0 },
          { start: '2023-11-09T05:00:00.000Z', value: 0 },
          { start: '2023-11-09T06:00:00.000Z', value: 0 },
          { start: '2023-11-09T07:00:00.000Z', value: 0.8380959628303 },
          { start: '2023-11-09T08:00:00.000Z', value: 1.0238729974310001 },
          { start: '2023-11-09T09:00:00.000Z', value: 1.0794490342696 },
          { start: '2023-11-09T10:00:00.000Z', value: 1.4767098000064 },
          { start: '2023-11-09T11:00:00.000Z', value: 2.3070157905924997 },
          { start: '2023-11-09T12:00:00.000Z', value: 2.2745886252332004 },
          { start: '2023-11-09T13:00:00.000Z', value: 2.1886075254843997 },
          { start: '2023-11-09T14:00:00.000Z', value: 1.1670300496954 },
          { start: '2023-11-09T15:00:00.000Z', value: 0.4682217865841 },
          { start: '2023-11-09T16:00:00.000Z', value: 0 },
          { start: '2023-11-09T17:00:00.000Z', value: 0 },
          { start: '2023-11-09T18:00:00.000Z', value: 0 },
          { start: '2023-11-09T19:00:00.000Z', value: 0 },
          { start: '2023-11-09T20:00:00.000Z', value: 0 },
          { start: '2023-11-09T21:00:00.000Z', value: 0 },
          { start: '2023-11-09T22:00:00.000Z', value: 0 },
          { start: '2023-11-09T23:00:00.000Z', value: 0 },
          { start: '2023-11-10T00:00:00.000Z', value: 0 },
          { start: '2023-11-10T01:00:00.000Z', value: 0 },
          { start: '2023-11-10T02:00:00.000Z', value: 0 },
          { start: '2023-11-10T03:00:00.000Z', value: 0 },
          { start: '2023-11-10T04:00:00.000Z', value: 0 },
          { start: '2023-11-10T05:00:00.000Z', value: 0 },
          { start: '2023-11-10T06:00:00.000Z', value: 0 },
          { start: '2023-11-10T07:00:00.000Z', value: 0.9076484803329999 },
          { start: '2023-11-10T08:00:00.000Z', value: 1.0421518590972 },
          { start: '2023-11-10T09:00:00.000Z', value: 2.36159012878 },
          { start: '2023-11-10T10:00:00.000Z', value: 2.6511120858978003 },
          { start: '2023-11-10T11:00:00.000Z', value: 2.6315590064889998 },
          { start: '2023-11-10T12:00:00.000Z', value: 2.6216709020022 },
          { start: '2023-11-10T13:00:00.000Z', value: 2.4150090252392 },
          { start: '2023-11-10T14:00:00.000Z', value: 1.9065797799711 },
          { start: '2023-11-10T15:00:00.000Z', value: 0.4827835233033 },
          { start: '2023-11-10T16:00:00.000Z', value: 0 },
          { start: '2023-11-10T17:00:00.000Z', value: 0 },
          { start: '2023-11-10T18:00:00.000Z', value: 0 },
          { start: '2023-11-10T19:00:00.000Z', value: 0 },
          { start: '2023-11-10T20:00:00.000Z', value: 0 },
        ],
        priceData: [
          {
            value: 0.2552,
            start: '2023-11-07T00:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2521,
            start: '2023-11-07T01:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2456,
            start: '2023-11-07T02:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2423,
            start: '2023-11-07T03:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2449,
            start: '2023-11-07T04:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2605,
            start: '2023-11-07T05:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2819,
            start: '2023-11-07T06:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3195,
            start: '2023-11-07T07:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3232,
            start: '2023-11-07T08:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2981,
            start: '2023-11-07T09:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2797,
            start: '2023-11-07T10:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2673,
            start: '2023-11-07T11:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2639,
            start: '2023-11-07T12:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.267,
            start: '2023-11-07T13:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2774,
            start: '2023-11-07T14:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2899,
            start: '2023-11-07T15:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2957,
            start: '2023-11-07T16:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3242,
            start: '2023-11-07T17:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3391,
            start: '2023-11-07T18:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3189,
            start: '2023-11-07T19:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.286,
            start: '2023-11-07T20:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.272,
            start: '2023-11-07T21:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2669,
            start: '2023-11-07T22:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2496,
            start: '2023-11-07T23:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2454,
            start: '2023-11-08T00:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2497,
            start: '2023-11-08T01:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2407,
            start: '2023-11-08T02:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2351,
            start: '2023-11-08T03:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2408,
            start: '2023-11-08T04:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2506,
            start: '2023-11-08T05:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2619,
            start: '2023-11-08T06:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2894,
            start: '2023-11-08T07:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.294,
            start: '2023-11-08T08:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2727,
            start: '2023-11-08T09:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2622,
            start: '2023-11-08T10:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2552,
            start: '2023-11-08T11:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2514,
            start: '2023-11-08T12:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2519,
            start: '2023-11-08T13:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2603,
            start: '2023-11-08T14:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2868,
            start: '2023-11-08T15:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3003,
            start: '2023-11-08T16:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.303,
            start: '2023-11-08T17:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3126,
            start: '2023-11-08T18:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.3053,
            start: '2023-11-08T19:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2917,
            start: '2023-11-08T20:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2718,
            start: '2023-11-08T21:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2601,
            start: '2023-11-08T22:00:00.000+01:00',
            exportPrice: 0,
          },
          {
            value: 0.2419,
            start: '2023-11-08T23:00:00.000+01:00',
            exportPrice: 0,
          },
        ],
        soc: 74,
      }

      n1.receive({ payload: inputPayload })
    })
  })
})
