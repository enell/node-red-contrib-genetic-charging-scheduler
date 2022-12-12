const { calculateBatteryChargingStrategy } = require('./strategy-battery-charging-functions')

module.exports = function (RED) {
  RED.nodes.registerType('enell-strategy-battery-charging', function (config) {
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
    // const populationSize = 20
    // const numberOfPricePeriods = 8
    // const generations = 400
    // const mutationRate = 0.03

    // const batteryMaxEnergy = 5 //kWh
    // const batteryMaxOutputPower = 2.5 //kW
    // // const batteryMaxInputPower = 2.5 //kW
    // const averageConsumption = 1.5 // kW

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
