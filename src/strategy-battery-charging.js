const {
  calculateBatteryChargingStrategy,
} = require('./strategy-battery-charging-functions')

module.exports = function (RED) {
  RED.nodes.registerType('enell-strategy-genetic-charging', function (config) {
    RED.nodes.createNode(this, config)

    const {
      populationSize,
      numberOfPricePeriods,
      generations,
      mutationRate,
      batteryMaxEnergy,
      batteryMaxOutputPower,
      batteryMaxInputPower,
      averageConsumption,
    } = config

    this.on('input', async (msg, send, done) => {
      const priceData = msg.payload?.priceData || []

      const schedule = calculateBatteryChargingStrategy({
        priceData,
        populationSize,
        numberOfPricePeriods,
        generations,
        mutationRate: mutationRate / 100,
        batteryMaxEnergy,
        batteryMaxOutputPower,
        batteryMaxInputPower,
        averageConsumption,
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
