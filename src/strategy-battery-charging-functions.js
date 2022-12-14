// import geneticAlgorithmConstructor from 'geneticalgorithm'
const geneticAlgorithmConstructor = require('geneticalgorithm')

const random = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min
}

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

const repair = (phenotype, endTime) => {
  const trimGene = (gene, endTime) => {
    if (gene.start < 0) {
      gene.duration += Math.max(gene.start, gene.duration * -1)
      gene.start = 0
    }
    if (gene.start > endTime) {
      gene.start = endTime - 1
    }
    gene.duration = clamp(gene.duration, 0, endTime - gene.start)
  }

  phenotype = phenotype.sort((a, b) => a.start - b.start)

  trimGene(phenotype[0], endTime)
  for (let i = 1; i < phenotype.length; i++) {
    let g1 = phenotype[i - 1]
    let g2 = phenotype[i]
    trimGene(g1, endTime)
    trimGene(g2, endTime)
    let diff = Math.floor(g2.start - (g1.start + g1.duration))
    if (diff <= 0) {
      let adjustment = (diff / 2) * -1
      g1.duration -= clamp(Math.ceil(adjustment), 0, g1.duration)
      g2.start += Math.floor(adjustment)
      g2.duration -= clamp(Math.ceil(adjustment), 0, g2.duration)
    }
  }
  return phenotype
}

const mutationFunction = (endTime, mutationRate) => (phenotype) => {
  const timeAdjustment = (endTime) => {
    const percent = Math.random() * 0.4 + 0.01
    const adjustment = Math.max(Math.floor(endTime * percent), 5) * (Math.random() < 0.5 ? -1 : 1)
    return adjustment
  }

  for (let i = 0; i < phenotype.length; i++) {
    let g = phenotype[i]
    if (Math.random() < mutationRate) {
      //Mutate action
      g.activity *= -1
    }
    if (Math.random() < mutationRate) {
      //Mutate start time
      const timeChange = timeAdjustment(endTime)
      g.start += timeChange
      g.duration -= timeChange
    }
    if (Math.random() < mutationRate) {
      //Mutate duration
      const timeChange = timeAdjustment(endTime)
      g.duration += timeChange
    }
  }
  phenotype = repair(phenotype, endTime)
  return phenotype
}

const crossoverFunction = (endTime) => (phenotypeA, phenotypeB) => {
  const midpoint = random(0, phenotypeA.length)
  const childGenes = []
  for (let i = 0; i < phenotypeA.length; i++) {
    if (i <= midpoint) {
      childGenes[i] = phenotypeA[i]
    } else {
      childGenes[i] = phenotypeB[i]
    }
  }

  return [repair(childGenes, endTime)]
}

const fitnessFunction =
  (priceData, endTime, batteryMaxEnergy, batteryMaxInputPower, averageConsumption) => (phenotype) => {
    let score = 0
    let batteryCurrentEnergy = 0 //kWh

    const calculateChargeScore = (price, interval) => {
      if (batteryCurrentEnergy < batteryMaxEnergy) {
        let batteryCharge = batteryMaxInputPower * (interval / 60) // kWh
        batteryCharge = Math.min(batteryCharge, batteryMaxEnergy - batteryCurrentEnergy)
        batteryCurrentEnergy += batteryCharge
        score += price * batteryCharge
      }
      score += price * (interval / 60) * averageConsumption
    }

    const calculateDischargeScore = (price, interval) => {
      let consumption = (interval / 60) * averageConsumption

      if (batteryCurrentEnergy > 0) {
        let batteryDischarge = Math.min(batteryCurrentEnergy, consumption)
        batteryCurrentEnergy -= batteryDischarge
        consumption -= batteryDischarge
      }
      score += price * consumption
    }

    const calculateNormalScore = (price, interval) => {
      score += price * (interval / 60) * averageConsumption
    }

    const calculatePeriodScore = (p, calculateScore) => {
      let hour = Math.floor(p.start / 60)
      let remainingDuration = p.duration
      let interval = 60 - (p.start % 60)
      for (let i = 0; remainingDuration > 0; i++) {
        calculateScore(priceData[hour].value, interval)

        remainingDuration -= interval
        interval = Math.min(remainingDuration, 60)
        hour++
      }
    }

    let nextNormalConsumptionPeriod = { start: 0, duration: 0, activity: 0 }
    phenotype.forEach((g) => {
      nextNormalConsumptionPeriod.duration = g.start - nextNormalConsumptionPeriod.start

      calculatePeriodScore(nextNormalConsumptionPeriod, calculateNormalScore)
      switch (g.activity) {
        case -1:
          calculatePeriodScore(g, calculateDischargeScore)
          break
        case 1:
          calculatePeriodScore(g, calculateChargeScore)
          break
      }
      nextNormalConsumptionPeriod.start = g.start + g.duration
    })

    // Last normal consumption interval
    nextNormalConsumptionPeriod.duration = endTime - nextNormalConsumptionPeriod.start
    calculatePeriodScore(nextNormalConsumptionPeriod, calculateNormalScore)

    return score * -1
  }

const generatePopulation = (endTime, populationSize, numberOfPricePeriods) => {
  const _sortedIndex = (array, value) => {
    let low = 0
    let high = array.length

    while (low < high) {
      let mid = (low + high) >>> 1
      if (array[mid].start < value.start) low = mid + 1
      else high = mid
    }
    return low
  }

  let population = []
  for (let i = 0; i < populationSize; i++) {
    let phenotype = []
    for (let j = 0; j < numberOfPricePeriods; j++) {
      let gene = { activity: 0, start: 0, duration: 0 }
      gene.activity = Math.random() < 0.5 ? -1 : 1
      gene.start = random(0, endTime)
      gene.duration = 0
      const location = _sortedIndex(phenotype, gene)
      phenotype.splice(location, 0, gene)
    }

    for (let j = 0; j < phenotype.length - 1; j++) {
      phenotype[j].duration = random(0, phenotype[j + 1].start - phenotype[j].start)
    }
    phenotype[phenotype.length - 1].duration = random(0, endTime - phenotype[phenotype.length - 1].start)

    population.push(phenotype)
  }
  return population
}

const toSchedule = (p, start) => {
  const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000)
  }

  let schedule = []
  p.forEach((g) => {
    if (g.duration > 0) {
      if (schedule.length > 0 && g.activity == schedule[schedule.length - 1].activity) {
        schedule[schedule.length - 1].duration += g.duration
      } else {
        let emptyPeriodStart = new Date(start)
        if (schedule.length > 0) {
          emptyPeriodStart = addMinutes(schedule[schedule.length - 1].start, schedule[schedule.length - 1].duration)
        }
        schedule.push({ start: emptyPeriodStart, activity: 0, name: 'none' })

        let periodStart = new Date(start)
        periodStart = addMinutes(periodStart, g.start)
        let name = g.activity == 1 ? 'charging' : 'discharging'
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
    emptyPeriodStart = addMinutes(schedule[schedule.length - 1].start, schedule[schedule.length - 1].duration)
  }
  schedule.push({ start: emptyPeriodStart, activity: 0, name: 'none' })

  return schedule
}

const calculateBatteryChargingStrategy = (config) => {
  const {
    priceData,
    populationSize,
    numberOfPricePeriods,
    generations,
    mutationRate,
    batteryMaxEnergy,
    batteryMaxInputPower,
    averageConsumption,
  } = config

  if (priceData == undefined || priceData.length == 0) return []

  let totalDuration = 0
  const start = new Date(priceData[0].start).valueOf()
  priceData.forEach((price) => {
    const s = (new Date(price.start).valueOf() - start) / 1000 / 60
    if (s > totalDuration) totalDuration = s
  })
  totalDuration += 60

  let geneticAlgorithm = geneticAlgorithmConstructor({
    mutationFunction: mutationFunction(totalDuration, mutationRate),
    crossoverFunction: crossoverFunction(totalDuration),
    fitnessFunction: fitnessFunction(
      priceData,
      totalDuration,
      batteryMaxEnergy,
      batteryMaxInputPower,
      averageConsumption
    ),
    population: generatePopulation(totalDuration, populationSize, numberOfPricePeriods),
  })

  for (let i = 0; i < generations; i++) {
    geneticAlgorithm.evolve()
  }

  return toSchedule(geneticAlgorithm.best(), priceData[0].start)
}

module.exports = {
  clamp,
  fitnessFunction,
  crossoverFunction,
  mutationFunction,
  calculateBatteryChargingStrategy,
}
