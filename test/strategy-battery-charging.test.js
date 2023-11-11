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

  it('uses forecasted solar data, consumption data and price data', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'strategy-genetic-charging',
        name: 'test name',
        populationSize: 50,
        numberOfPricePeriods: 24,
        generations: 150,
        mutationRate: 3,
        batteryMaxEnergy: 14,
        batteryMaxInputPower: 3.2,
        batteryMaxOutputPower: 3.5,
        averageConsumption: 1,
        wires: [['n2']],
        excessPvEnergyUse: 1,
        combineSchedules: 1,
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
          { start: '2023-11-10T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-11T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-11T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-11T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-11T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-11T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-11T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-11T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-11T07:00:00.000Z', value: 1 },
          { start: '2023-11-11T08:00:00.000Z', value: 1 },
          { start: '2023-11-11T09:00:00.000Z', value: 1 },
          { start: '2023-11-11T10:00:00.000Z', value: 2 },
          { start: '2023-11-11T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-11T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-11T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-11T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-11T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-11T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-11T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-11T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-11T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-11T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-11T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-11T22:00:00.000Z', value: 0.35 },
          { start: '2023-11-11T23:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T00:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T01:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T02:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T03:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T04:00:00.000Z', value: 0.35 },
          { start: '2023-11-12T05:00:00.000Z', value: 0.5 },
          { start: '2023-11-12T06:00:00.000Z', value: 0.55 },
          { start: '2023-11-12T07:00:00.000Z', value: 1 },
          { start: '2023-11-12T08:00:00.000Z', value: 1 },
          { start: '2023-11-12T09:00:00.000Z', value: 1 },
          { start: '2023-11-12T10:00:00.000Z', value: 2 },
          { start: '2023-11-12T11:00:00.000Z', value: 1.5 },
          { start: '2023-11-12T12:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T13:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T14:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T15:00:00.000Z', value: 0.5 },
          { start: '2023-11-12T16:00:00.000Z', value: 0.4 },
          { start: '2023-11-12T17:00:00.000Z', value: 0.5 },
          { start: '2023-11-12T18:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T19:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T20:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T21:00:00.000Z', value: 0.6 },
          { start: '2023-11-12T22:00:00.000Z', value: 0.35 },
        ],
        productionForecast: [
          { start: '2023-11-10T14:00:00.000Z', value: 1.1561384873896 },
          { start: '2023-11-10T15:00:00.000Z', value: 0.0464114684227 },
          { start: '2023-11-10T16:00:00.000Z', value: 0 },
          { start: '2023-11-10T17:00:00.000Z', value: 0 },
          { start: '2023-11-10T18:00:00.000Z', value: 0 },
          { start: '2023-11-10T19:00:00.000Z', value: 0 },
          { start: '2023-11-10T20:00:00.000Z', value: 0 },
          { start: '2023-11-10T21:00:00.000Z', value: 0 },
          { start: '2023-11-10T22:00:00.000Z', value: 0 },
          { start: '2023-11-10T23:00:00.000Z', value: 0 },
          { start: '2023-11-11T00:00:00.000Z', value: 0 },
          { start: '2023-11-11T01:00:00.000Z', value: 0 },
          { start: '2023-11-11T02:00:00.000Z', value: 0 },
          { start: '2023-11-11T03:00:00.000Z', value: 0 },
          { start: '2023-11-11T04:00:00.000Z', value: 0 },
          { start: '2023-11-11T05:00:00.000Z', value: 0 },
          { start: '2023-11-11T06:00:00.000Z', value: 0 },
          { start: '2023-11-11T07:00:00.000Z', value: 1.0491445110892 },
          { start: '2023-11-11T08:00:00.000Z', value: 1.0912388482622 },
          { start: '2023-11-11T09:00:00.000Z', value: 2.2541659163016003 },
          { start: '2023-11-11T10:00:00.000Z', value: 2.4654968790605 },
          { start: '2023-11-11T11:00:00.000Z', value: 2.5506386093107 },
          { start: '2023-11-11T12:00:00.000Z', value: 2.2170677207684997 },
          { start: '2023-11-11T13:00:00.000Z', value: 1.9039576657793 },
          { start: '2023-11-11T14:00:00.000Z', value: 0.8912977422788 },
          { start: '2023-11-11T15:00:00.000Z', value: 0.048608421018999995 },
          { start: '2023-11-11T16:00:00.000Z', value: 0 },
          { start: '2023-11-11T17:00:00.000Z', value: 0 },
          { start: '2023-11-11T18:00:00.000Z', value: 0 },
          { start: '2023-11-11T19:00:00.000Z', value: 0 },
          { start: '2023-11-11T20:00:00.000Z', value: 0 },
          { start: '2023-11-11T21:00:00.000Z', value: 0 },
          { start: '2023-11-11T22:00:00.000Z', value: 0 },
          { start: '2023-11-11T23:00:00.000Z', value: 0 },
          { start: '2023-11-12T00:00:00.000Z', value: 0 },
          { start: '2023-11-12T01:00:00.000Z', value: 0 },
          { start: '2023-11-12T02:00:00.000Z', value: 0 },
          { start: '2023-11-12T03:00:00.000Z', value: 0 },
          { start: '2023-11-12T04:00:00.000Z', value: 0 },
          { start: '2023-11-12T05:00:00.000Z', value: 0 },
          { start: '2023-11-12T06:00:00.000Z', value: 0 },
          { start: '2023-11-12T07:00:00.000Z', value: 0.7097051309193999 },
          { start: '2023-11-12T08:00:00.000Z', value: 0.8928244029784 },
          { start: '2023-11-12T09:00:00.000Z', value: 2.1365225989126 },
          { start: '2023-11-12T10:00:00.000Z', value: 2.6995754307818003 },
          { start: '2023-11-12T11:00:00.000Z', value: 2.7070397400609 },
          { start: '2023-11-12T12:00:00.000Z', value: 2.7150984359242 },
          { start: '2023-11-12T13:00:00.000Z', value: 2.5719721871312 },
          { start: '2023-11-12T14:00:00.000Z', value: 1.6851500308515999 },
          { start: '2023-11-12T15:00:00.000Z', value: 0.4864715616479 },
          { start: '2023-11-12T16:00:00.000Z', value: 0 },
          { start: '2023-11-12T17:00:00.000Z', value: 0 },
          { start: '2023-11-12T18:00:00.000Z', value: 0 },
          { start: '2023-11-12T19:00:00.000Z', value: 0 },
          { start: '2023-11-12T20:00:00.000Z', value: 0 },
          { start: '2023-11-12T21:00:00.000Z', value: 0 },
          { start: '2023-11-12T22:00:00.000Z', value: 0 },
          { start: '2023-11-12T23:00:00.000Z', value: 0 },
          { start: '2023-11-13T00:00:00.000Z', value: 0 },
          { start: '2023-11-13T01:00:00.000Z', value: 0 },
          { start: '2023-11-13T02:00:00.000Z', value: 0 },
          { start: '2023-11-13T03:00:00.000Z', value: 0 },
          { start: '2023-11-13T04:00:00.000Z', value: 0 },
          { start: '2023-11-13T05:00:00.000Z', value: 0 },
          { start: '2023-11-13T06:00:00.000Z', value: 0 },
          { start: '2023-11-13T07:00:00.000Z', value: 0.7581343269962 },
          { start: '2023-11-13T08:00:00.000Z', value: 0.8500641547061 },
          { start: '2023-11-13T09:00:00.000Z', value: 0.8713341844378 },
          { start: '2023-11-13T10:00:00.000Z', value: 0.8457893364988001 },
          { start: '2023-11-13T11:00:00.000Z', value: 0.7808989663047999 },
          { start: '2023-11-13T12:00:00.000Z', value: 0.7493430708129 },
          { start: '2023-11-13T13:00:00.000Z', value: 0.7565173176753 },
          { start: '2023-11-13T14:00:00.000Z', value: 0.686363112781 },
          { start: '2023-11-13T15:00:00.000Z', value: 0 },
          { start: '2023-11-13T16:00:00.000Z', value: 0 },
          { start: '2023-11-13T17:00:00.000Z', value: 0 },
          { start: '2023-11-13T18:00:00.000Z', value: 0 },
          { start: '2023-11-13T19:00:00.000Z', value: 0 },
          { start: '2023-11-13T20:00:00.000Z', value: 0 },
          { start: '2023-11-13T21:00:00.000Z', value: 0 },
          { start: '2023-11-13T22:00:00.000Z', value: 0 },
          { start: '2023-11-13T23:00:00.000Z', value: 0 },
          { start: '2023-11-14T00:00:00.000Z', value: 0 },
          { start: '2023-11-14T01:00:00.000Z', value: 0 },
          { start: '2023-11-14T02:00:00.000Z', value: 0 },
          { start: '2023-11-14T03:00:00.000Z', value: 0 },
          { start: '2023-11-14T04:00:00.000Z', value: 0 },
          { start: '2023-11-14T05:00:00.000Z', value: 0 },
          { start: '2023-11-14T06:00:00.000Z', value: 0 },
          { start: '2023-11-14T07:00:00.000Z', value: 0.6057586910998 },
          { start: '2023-11-14T08:00:00.000Z', value: 0.7120577071494 },
          { start: '2023-11-14T09:00:00.000Z', value: 1.4671873887955 },
          { start: '2023-11-14T10:00:00.000Z', value: 2.3820273991058003 },
          { start: '2023-11-14T11:00:00.000Z', value: 2.5117028351757997 },
          { start: '2023-11-14T12:00:00.000Z', value: 2.1745738839632 },
          { start: '2023-11-14T13:00:00.000Z', value: 1.7587150413459 },
        ],
        soc: 66.4,
        priceData: [
          {
            value: 0.2652,
            start: '2023-11-11T00:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2635,
            start: '2023-11-11T01:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2635,
            start: '2023-11-11T02:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2604,
            start: '2023-11-11T03:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2598,
            start: '2023-11-11T04:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.263,
            start: '2023-11-11T05:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.264,
            start: '2023-11-11T06:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2661,
            start: '2023-11-11T07:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2708,
            start: '2023-11-11T08:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2743,
            start: '2023-11-11T09:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.27,
            start: '2023-11-11T10:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2687,
            start: '2023-11-11T11:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.266,
            start: '2023-11-11T12:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2658,
            start: '2023-11-11T13:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2702,
            start: '2023-11-11T14:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2838,
            start: '2023-11-11T15:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.299,
            start: '2023-11-11T16:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.3136,
            start: '2023-11-11T17:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.3229,
            start: '2023-11-11T18:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.3095,
            start: '2023-11-11T19:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2964,
            start: '2023-11-11T20:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2834,
            start: '2023-11-11T21:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2713,
            start: '2023-11-11T22:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2654,
            start: '2023-11-11T23:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2679,
            start: '2023-11-12T00:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2629,
            start: '2023-11-12T01:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2628,
            start: '2023-11-12T02:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2605,
            start: '2023-11-12T03:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2615,
            start: '2023-11-12T04:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2647,
            start: '2023-11-12T05:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.264,
            start: '2023-11-12T06:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2644,
            start: '2023-11-12T07:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2656,
            start: '2023-11-12T08:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2681,
            start: '2023-11-12T09:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2668,
            start: '2023-11-12T10:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2645,
            start: '2023-11-12T11:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2662,
            start: '2023-11-12T12:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2673,
            start: '2023-11-12T13:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2729,
            start: '2023-11-12T14:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2917,
            start: '2023-11-12T15:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.3087,
            start: '2023-11-12T16:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.3259,
            start: '2023-11-12T17:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.318,
            start: '2023-11-12T18:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.3106,
            start: '2023-11-12T19:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.3003,
            start: '2023-11-12T20:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2891,
            start: '2023-11-12T21:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2805,
            start: '2023-11-12T22:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
          {
            value: 0.2661,
            start: '2023-11-12T23:00:00.000+01:00',
            exportPrice: 0.0908909975,
          },
        ],
        schedule: [
          {
            start: '2023-11-11T15:00:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 688,
            cost: -0.026476342365218057,
            charge: -4.964724912314334,
          },
          {
            start: '2023-11-12T02:28:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 362,
            cost: 0.6403721586139037,
            charge: 0,
          },
          {
            start: '2023-11-12T08:30:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 208,
            cost: -0.16476527780236702,
            charge: -0.25232303156189984,
          },
          {
            start: '2023-11-12T11:27:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 339,
            cost: -0.5975769214023297,
            charge: 0,
          },
          {
            start: '2023-11-12T17:06:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 75,
            cost: 0,
            charge: -0.5349999999999997,
          },
          {
            start: '2023-11-12T18:21:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 34,
            cost: 0.0901,
            charge: 0,
          },
          {
            start: '2023-11-12T18:55:00+01:00',
            activity: -1,
            name: 'discharging',
            duration: 239,
            cost: 0.046482948257283434,
            charge: -2.2159520561237667,
          },
          {
            start: '2023-11-12T22:54:00+01:00',
            activity: 0,
            name: 'idle',
            duration: 66,
            cost: 0.109965,
            charge: 0,
          },
        ],
        excessPvEnergyUse: 0,
        cost: 0.09810156530127245,
        noBattery: {
          schedule: [
            {
              start: '2023-11-11T14:00:00.000Z',
              activity: 0,
              name: 'idle',
              duration: 1980,
              cost: 2.469259941511999,
              charge: 0,
            },
          ],
          excessPvEnergyUse: 0,
          cost: 2.469259941511999,
        },
        timestamp: 1699711560000,
      }

      n1.receive({ payload: inputPayload })
    })
  })
})
