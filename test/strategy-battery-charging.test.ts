import node from '../src/strategy-battery-charging'
import helper from 'node-red-node-test-helper'



describe('Battery charging strategy Node', () => {
  afterEach(() => {
    helper.unload()
  })

  it('should be loaded', done => {
    var flow = [{ id: 'n1', type: 'enell-strategy-battery-charging', name: 'test name' }]

    helper.load(node, flow, function () {
      var n1 = helper.getNode('n1')
      expect(n1.name).toBe('test name')
      done()
    })
  })

  it('should send schedule in payload', done => {
    var flow = [{ id: "n1", type: "enell-strategy-battery-charging", name: "test name", wires: [["n2"]] }, { id: "n2", type: "helper" }];
    helper.load(node, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        expect(msg).toHaveProperty('payload');
        expect(msg.payload).toHaveProperty('schedule');
        done();
      });

      const inputPayload = {
        payload: {
          priceData: [
            { value: 1, start: '2022-12-01T00:00:00.000Z' },
            { value: 2, start: '2022-12-01T01:00:00.000Z' },
            { value: 5, start: '2022-12-01T02:00:00.000Z' },
          ]
        }
      }

      n1.receive(inputPayload);
    });
  })

  it('should send handle empty priceData', done => {
    var flow = [{ id: "n1", type: "enell-strategy-battery-charging", name: "test name", wires: [["n2"]] }, { id: "n2", type: "helper" }];
    helper.load(node, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        expect(msg).toHaveProperty('payload');
        expect(msg.payload).toHaveProperty('schedule');
        done();
      });

      n1.receive({ payload: {} });
      n1.receive({});
    });
  })
})
