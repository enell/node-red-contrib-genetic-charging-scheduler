import node from '../src/node'
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
})
