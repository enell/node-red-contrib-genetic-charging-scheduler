import { calculateBatteryChargingStrategy } from './strategy-battery-charging-functions'

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
    }
  )
}

export default node
