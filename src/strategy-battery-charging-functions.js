const geneticAlgorithmConstructor = require('geneticalgorithm')
const { fitnessFunction } = require('./fitness')

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

const repair = (phenotype, endTime) => {
  const trimGene = (gene) => {
    if (gene.start < 0) {
      gene.duration += Math.max(gene.start, gene.duration * -1)
      gene.start = 0
    }
    if (gene.start > endTime) {
      gene.start = endTime - 1
    }
    gene.duration = clamp(gene.duration, 0, endTime - gene.start)
  }

  const p = phenotype.sort((a, b) => a.start - b.start)

  trimGene(p[0])
  for (let i = 1; i < p.length; i += 1) {
    const g1 = p[i - 1]
    const g2 = p[i]
    trimGene(g1)
    trimGene(g2)
    const diff = Math.floor(g2.start - (g1.start + g1.duration))
    if (diff <= 0) {
      const adjustment = (diff / 2) * -1
      g1.duration -= clamp(Math.ceil(adjustment), 0, g1.duration)
      g2.start += Math.floor(adjustment)
      g2.duration -= clamp(Math.ceil(adjustment), 0, g2.duration)
    }
  }
  return p
}

const mutationFunction =
  (endTime, mutationRate, excessPvEnergyUse) => (phenotype) => {
    const timeAdjustment = () => {
      return random(0, 61) - 30
    }

    for (let i = 0; i < phenotype.periods.length; i += 1) {
      const g = phenotype.periods[i]
      if (Math.random() < mutationRate) {
        // Mutate action
        g.activity *= -1
      }
      if (Math.random() < mutationRate) {
        // Mutate start time
        const timeChange = timeAdjustment()
        g.start += timeChange
        g.duration -= timeChange
      }
      if (Math.random() < mutationRate) {
        // Mutate duration
        const timeChange = timeAdjustment()
        g.duration += timeChange
      }
    }
    return {
      periods: repair(phenotype.periods, endTime),
      excessPvEnergyUse: excessPvEnergyUse,
    }
  }

const crossoverFunction = (endTime) => (phenotypeA, phenotypeB) => {
  const midpoint = random(0, phenotypeA.periods.length)
  const childGenes = []
  for (let i = 0; i < phenotypeA.periods.length; i += 1) {
    if (i <= midpoint) {
      childGenes[i] = phenotypeA.periods[i]
    } else {
      childGenes[i] = phenotypeB.periods[i]
    }
  }

  return [
    {
      periods: repair(childGenes, endTime),
      excessPvEnergyUse:
        Math.random() < 0.5
          ? phenotypeA.excessPvEnergyUse
          : phenotypeB.excessPvEnergyUse,
    },
  ]
}

const generatePopulation = (
  endTime,
  populationSize,
  numberOfPricePeriods,
  excessPvEnergyUse
) => {
  const sortedIndex = (array, value) => {
    let low = 0
    let high = array.length

    while (low < high) {
      // eslint-disable-next-line no-bitwise
      const mid = (low + high) >>> 1
      if (array[mid].start < value.start) low = mid + 1
      else high = mid
    }
    return low
  }

  const population = []
  for (let i = 0; i < populationSize; i += 1) {
    const timePeriods = []
    for (let j = 0; j < numberOfPricePeriods; j += 1) {
      const gene = { activity: 0, start: 0, duration: 0 }
      gene.activity = Math.random() < 0.5 ? -1 : 1
      gene.start = random(0, endTime)
      gene.duration = 0
      const location = sortedIndex(timePeriods, gene)
      timePeriods.splice(location, 0, gene)
    }

    for (let j = 0; j < timePeriods.length - 1; j += 1) {
      const maxDuration = timePeriods[j + 1].start - timePeriods[j].start
      timePeriods[j].duration = random(0, maxDuration)
    }
    const maxDuration = endTime - timePeriods[timePeriods.length - 1].start
    timePeriods[timePeriods.length - 1].duration = random(0, maxDuration)

    population.push({
      periods: timePeriods,
      excessPvEnergyUse: excessPvEnergyUse,
    })
  }
  return population
}

const toSchedule = (p, start) => {
  const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000)
  }

  const schedule = []
  p.forEach((g) => {
    if (g.duration > 0) {
      if (
        schedule.length > 0 &&
        g.activity === schedule[schedule.length - 1].activity
      ) {
        schedule[schedule.length - 1].duration += g.duration
      } else {
        let emptyPeriodStart = new Date(start)
        if (schedule.length > 0) {
          emptyPeriodStart = addMinutes(
            schedule[schedule.length - 1].start,
            schedule[schedule.length - 1].duration
          )
        }
        schedule.push({
          start: emptyPeriodStart,
          activity: 0,
          name: 'none',
        })

        let periodStart = new Date(start)
        periodStart = addMinutes(periodStart, g.start)
        const name = g.activity === 1 ? 'charging' : 'discharging'
        schedule.push({
          start: periodStart,
          activity: g.activity,
          duration: g.duration,
          name,
        })
      }
    }
  })

  let emptyPeriodStart = new Date(start)
  if (schedule.length > 0) {
    emptyPeriodStart = addMinutes(
      schedule[schedule.length - 1].start,
      schedule[schedule.length - 1].duration
    )
  }
  schedule.push({ start: emptyPeriodStart, activity: 0, name: 'none' })

  return schedule
}

const mergeInput = (config) => {
  const {
    averageConsumption,
    averageProduction,
    priceData,
    consumptionForecast,
    productionForecast,
  } = config

  let now = Date.now()
  now = new Date(now - (now % (60 * 60 * 1000)))
  return priceData
    .filter((v) => new Date(v.start).getTime() >= now.getTime())
    .map((v) => {
      return {
        start: new Date(v.start),
        importPrice: v.importPrice ?? v.value,
        exportPrice: v.exportPrice ?? v.importPrice ?? v.value,
        consumption:
          consumptionForecast.find(
            (c) => new Date(c.start).getTime() === new Date(v.start).getTime()
          )?.value ??
          averageConsumption ??
          0,
        production:
          productionForecast.find(
            (p) => new Date(p.start).getTime() === new Date(v.start).getTime()
          )?.value ??
          averageProduction ??
          0,
      }
    })
}

const calculateBatteryChargingStrategy = (config) => {
  const {
    populationSize,
    numberOfPricePeriods,
    generations,
    mutationRate,
    batteryMaxEnergy,
    batteryMaxInputPower,
    soc,
    excessPvEnergyUse,
  } = config

  const input = mergeInput(config)
  if (input === undefined || input.length === 0) return {}

  let totalDuration = input.length * 60

  const f = fitnessFunction({
    input,
    totalDuration,
    batteryMaxEnergy,
    batteryMaxInputPower,
    soc,
  })
  const geneticAlgorithm = geneticAlgorithmConstructor({
    mutationFunction: mutationFunction(
      totalDuration,
      mutationRate,
      excessPvEnergyUse
    ),
    crossoverFunction: crossoverFunction(totalDuration),
    fitnessFunction: f,
    population: generatePopulation(
      totalDuration,
      populationSize,
      numberOfPricePeriods,
      excessPvEnergyUse
    ),
  })

  for (let i = 0; i < generations; i += 1) {
    geneticAlgorithm.evolve()
  }

  const best = geneticAlgorithm.best()
  const noBattery = { periods: [], excessPvEnergyUse: 0 }
  return {
    best: {
      schedule: toSchedule(best.periods, input[0].start),
      excessPvEnergyUse: best.excessPvEnergyUse,
      cost: f(best) * -1,
    },
    noBattery: {
      schedule: toSchedule(noBattery.periods, input[0].start),
      excessPvEnergyUse: noBattery.excessPvEnergyUse,
      cost: f(noBattery) * -1,
    },
  }
}

module.exports = {
  clamp,
  crossoverFunction,
  mutationFunction,
  fitnessFunction,
  calculateBatteryChargingStrategy,
}
