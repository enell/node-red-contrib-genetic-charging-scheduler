# genetic-charging-scheduler

This project provides a node for node-red to calculate charging schedules for batteries utilizing solar forecast, consumption forecast (or just average consumption), flexible price forecast and the current SoC (state of charge) of the battery. It can also be used, to charge the battery when prices are cheap, and discharge the battery to sell energy, when it is expensive. So it can be used together with a PV-system or as standalone battery system to trade with energy.

Be aware, that some countries do not allow to sell energy to the grid. In that case it is also possible, to configure the price for selling energy to a very low value, so discharging the battery is only calculated based on the consumption provided.