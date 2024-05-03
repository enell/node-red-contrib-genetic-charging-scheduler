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
        type: 'enell-strategy-genetic-charging',
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

  it('should handle empty priceData', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'enell-strategy-genetic-charging',
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
})
