import { NodeAPI, Node } from 'node-red'
import { calculateBatteryChargingStrategy } from "./strategy-battery-charging-functions"


export default (RED: NodeAPI): void => {

  RED.nodes.registerType("enell-strategy-battery-charging", function (this: Node, config: any): void {
    RED.nodes.createNode(this, config);

    this.on("input", async (msg: any, send, done) => {
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
      });

      if (msg.payload) {
        msg.payload.schedule = schedule
      } else {
        msg.payload = { schedule }
      }
      send(msg);
      done();
    });

  });
}
