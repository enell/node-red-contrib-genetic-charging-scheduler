# genetic-charging-scheduler

This project provides a node for node-red to calculate charging schedules for batteries utilizing solar forecast, consumption forecast (or just average consumption), flexible price forecast and the current SoC (state of charge) of the battery. It can also be used, to charge the battery when prices are cheap, and discharge the battery to sell energy, when it is expensive. So it can be used together with a PV-system or as standalone battery system to trade with energy.

Be aware, that some countries do not allow to sell energy to the grid. In that case it is also possible, to configure the price for selling energy to a very low value, so discharging the battery is only calculated based on the consumption provided.

# Installation

TODO

# Usage

You need to at least provide the current SoC of the battery and a list of prices for the next hours, so a schedule can be generated, so a minimum example would for example look like this:

![Sample](img/minimum%20sample.png)

## Input

The node expects the input data to be in a format like this:
```json
{
        consumptionForecast: [
          { start: '2023-11-07T05:00:00.000Z', value: 0.35 }, // kWh
          { start: '2023-11-07T06:00:00.000Z', value: 0.35 },
          ...
        ],
        productionForecast: [
          { start: '2023-11-07T05:00:00.000Z', value: 0 },
          { start: '2023-11-07T06:00:00.000Z', value: 0.037584765924899996 }, // kWh
          ...
        ],
        priceData: [
          {
            value: 0.2552, // price
            start: '2023-11-07T00:00:00.000+01:00',
            exportPrice: 0, // sell
            importPrice: 0.2552 // buy
          },
          {
            value: 0.2521,
            start: '2023-11-07T01:00:00.000+01:00',
            exportPrice: 0
          },
          ...
        ],
        soc: 74
      }
```

`consumptionForecast` [optional] contains the consumption of the house, which is powered by the battery. If not provided, the average consumption from the node config is used.

`productionForecast` [optional] is the forecast of the PV-system and should contain the forecasted production of energy in kWh.

`priceData` contains the prices, your energy provider should provide (or any other APIs where you can get it). This is mandatory. However not all params are mandatory. `value` is always the fallback in case no import or export prices are provided. So if only `value` is provided, both import and export prices are set to that value. To overwrite that, just add them to the payload. If `exportPrice` is set to 0, it should not sell energy to the grid. If your import and export prices are different, you should specify these two properties.

`soc` is the current state of charge of your battery in %. This is used to calculate how much energy your battery has and based on forecast and consumption calculates when it would be best to charge or discharge. 

## Output

The output looks like this:
```json
{
  "schedule": [
    {
      "start": "2023-11-08T09:59:00.000Z",
      "activity": -1,
      "name": "discharging",
      "duration": 2,
      "cost": 0,
      "charge": 0
    },
    {
      "start": "2023-11-08T10:01:00.000Z",
      "activity": 0,
      "name": "idle",
      "duration": 270,
      "cost": 0,
      "charge": 0
    },
    {
      "start": "2023-11-08T14:31:00.000Z",
      "activity": 1,
      "name": "charging",
      "duration": 10,
      "cost": 0.0909040451855201,
      "charge": 0.5333333333333332
    },
    ...
  ],
  "excessPvEnergyUse": 0,
  "cost": 0.659243055395769,
  "noBattery": {
    "schedule": [...],
    "excessPvEnergyUse": 0,
    "cost": 1.0514269898056559
  }
}
```
`schedule` contains the calculated schedule. Activity (-1, 0, 1) and name provide information if battery should be `charging`, `idle` or `discharging` during that time. `cost` provides the cost of the charged/discharged enery during that timeslot and reflects the amount of money you have to pay when you buy or earn when you sell energy. `charge` is the amount of kWh for that time slot. `duration` is the duration in minutes.

`cost` provides the value of cost for the whole schedule (all charging and discharging, consumption and forecast of solar energy considered).

`noBattery` provides information about the prices you would have to pay without a battery.

The output of the schedules can be used, to generate schedules to control the battery. `discharging` means the battery will discharge with the provided amount of energy during that time. If you provided `exportPrice: 0` as input, it just means the battery is discharging due to the consumption during that time. If an exportPrice is provided, it could also mean you have to discharge during that timeslot for earning money. `idle` can indicate, that the prices are low, but it doesn't make sense to charge (either as battery is already full, or as it doesn't make sense to charge and discharge with the same price). `charging` means that the battery should be charged from grid with the provided amount of energy.