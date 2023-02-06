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

const mutationFunction = (endTime, mutationRate) => (phenotype) => {
  const timeAdjustment = () => {
    const percent = Math.random() * 0.4 + 0.01
    const adjustment =
      Math.max(Math.floor(endTime * percent), 5) *
      (Math.random() < 0.5 ? -1 : 1)
    return adjustment
  }

  for (let i = 0; i < phenotype.length; i += 1) {
    const g = phenotype[i]
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
  return repair(phenotype, endTime)
}

const crossoverFunction = (endTime) => (phenotypeA, phenotypeB) => {
  const midpoint = random(0, phenotypeA.length)
  const childGenes = []
  for (let i = 0; i < phenotypeA.length; i += 1) {
    if (i <= midpoint) {
      childGenes[i] = phenotypeA[i]
    } else {
      childGenes[i] = phenotypeB[i]
    }
  }

  return [repair(childGenes, endTime)]
}

const generatePopulation = (endTime, populationSize, numberOfPricePeriods) => {
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
    const phenotype = []
    for (let j = 0; j < numberOfPricePeriods; j += 1) {
      const gene = { activity: 0, start: 0, duration: 0 }
      gene.activity = Math.random() < 0.5 ? -1 : 1
      gene.start = random(0, endTime)
      gene.duration = 0
      const location = sortedIndex(phenotype, gene)
      phenotype.splice(location, 0, gene)
    }

    for (let j = 0; j < phenotype.length - 1; j += 1) {
      phenotype[j].duration = random(
        0,
        phenotype[j + 1].start - phenotype[j].start
      )
    }
    phenotype[phenotype.length - 1].duration = random(
      0,
      endTime - phenotype[phenotype.length - 1].start
    )

    population.push(phenotype)
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

const calculateBatteryChargingStrategy = (config) => {
  const {
    populationSize,
    numberOfPricePeriods,
    generations,
    mutationRate,
    batteryMaxEnergy,
    batteryMaxInputPower,
    averageConsumption,
    averageProduction,
    soc,
  } = config

  let { priceData } = config
  if (Number.isInteger(soc)) {
    let now = Date.now()
    now = new Date(now - (now % (60 * 60 * 1000)))

    priceData = priceData.filter((v) => new Date(v.start) >= now)
  }

  if (priceData === undefined || priceData.length === 0) return []

  let totalDuration = 0
  const start = new Date(priceData[0].start).valueOf()
  priceData.forEach((price) => {
    const s = (new Date(price.start).valueOf() - start) / 1000 / 60
    if (s > totalDuration) totalDuration = s
  })
  totalDuration += 60

  const geneticAlgorithm = geneticAlgorithmConstructor({
    mutationFunction: mutationFunction(totalDuration, mutationRate),
    crossoverFunction: crossoverFunction(totalDuration),
    fitnessFunction: fitnessFunction({
      priceData,
      totalDuration,
      batteryMaxEnergy,
      batteryMaxInputPower,
      averageConsumption,
      averageProduction,
      soc,
    }),
    population: generatePopulation(
      totalDuration,
      populationSize,
      numberOfPricePeriods
    ),
  })

  for (let i = 0; i < generations; i += 1) {
    geneticAlgorithm.evolve()
  }

  return toSchedule(geneticAlgorithm.best(), priceData[0].start)
}

module.exports = {
  clamp,
  crossoverFunction,
  mutationFunction,
  fitnessFunction,
  calculateBatteryChargingStrategy,
}
