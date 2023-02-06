const {
  calculateBatteryChargingStrategy,
} = require('./strategy-battery-charging-functions')

const node = (RED) => {
  RED.nodes.registerType(
    'enell-strategy-genetic-charging',
    function callback(config) {
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
        const priceData = msg.payload?.priceData ?? []
        const consumptionForecast = msg.payload?.consumptionForecast ?? []
        const productionForecast = msg.payload?.productionForecast ?? []
        const soc = msg.payload?.soc ?? 0

        const schedule = calculateBatteryChargingStrategy({
          priceData,
          consumptionForecast,
          productionForecast,
          populationSize,
          numberOfPricePeriods,
          generations,
          mutationRate: mutationRate / 100,
          batteryMaxEnergy,
          batteryMaxOutputPower,
          batteryMaxInputPower,
          averageConsumption,
          consumptionForecast,
          productionForecast,
          soc: soc / 100,
        })

        if (msg.payload) {
          msg.payload.schedule = schedule
        } else {
          msg.payload = { schedule }
        }

        send(msg)
        done()
      })
    }
  )
}

module.exports = node
