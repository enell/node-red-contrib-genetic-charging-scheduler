const { calculateBatteryChargingStrategy } = require('./strategy-battery-charging-functions')

module.exports = function (RED) {
  RED.nodes.registerType('enell-strategy-battery-charging', function (config) {
    RED.nodes.createNode(this, config)

    this.on('input', async (msg, send, done) => {
      const priceData = msg.payload?.priceData || []
      const populationSize = 20
      const numberOfPricePeriods = 8
      const generations = 400
      const mutationRate = 0.03

      const schedule = calculateBatteryChargingStrategy({
        priceData,
        populationSize,
        numberOfPricePeriods,
        generations,
        mutationRate,
      })

      if (msg.payload) {
        msg.payload.schedule = schedule
      } else {
        msg.payload = { schedule }
      }
      send(msg)
      done()
    })
  })
}
