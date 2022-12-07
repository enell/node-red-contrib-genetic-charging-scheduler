import geneticAlgorithmConstructor from 'geneticalgorithm'

export interface Gene {
  start: number;
  duration: number;
  activity: Activity;
}

export interface Price {
  value: number;
  start: string;
}

export enum Activity {
  Discharge = -1,
  None = 0,
  Charge = 1,
}

export interface Event {
  start: Date;
  activity: Activity;
  duration: number;
}

export type Phenotype = Gene[]

export type Population = Phenotype[]

export type PriceData = Price[]

export type Schedule = Event[]


const random = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min
}

export const clamp = (num: number, min: number, max: number) => {
  return Math.min(Math.max(num, min), max)
}

export const repair = (phenotype: Phenotype, endTime: number) => {
  const trimGene = (gene: Gene, endTime: number) => {
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

export const mutationFunction = (endTime: number, mutationRate: number) => (phenotype: Phenotype) => {
  const timeAdjustment = (endTime: number) => {
    const percent = Math.random() * 0.1 + 0.01
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

export const crossoverFunction = (endTime: number) => (phenotypeA: Phenotype, phenotypeB: Phenotype) => {
  const midpoint = random(0, phenotypeA.length)
  const childGenes: Phenotype = []
  for (let i = 0; i < phenotypeA.length; i++) {
    if (i <= midpoint) {
      childGenes[i] = phenotypeA[i]
    } else {
      childGenes[i] = phenotypeB[i]
    }
  }

  return [repair(childGenes, endTime)]
}

export const fitnessFunction = (priceData: PriceData, endTime: number) => (phenotype: Phenotype) => {
  let score = 0

  const batteryMaxEnergy = 5 //kWh
  // const batteryMaxOutputPower = 2.5 //kW
  const batteryMaxInputPower = 2.5 //kW
  const averageConsumption = 1.5 // kW
  let batteryCurrentEnergy = 0 //kWh

  const calculateChargeScore = (price: number, interval: number) => {
    // console.log('calculateChargeScore ' + price.value + ' ' + interval + ' ' + score + ' ' + batteryCurrentEnergy)
    if (batteryCurrentEnergy < batteryMaxEnergy) {
      let batteryCharge = batteryMaxInputPower * (interval / 60) // kWh
      batteryCharge = Math.min(batteryCharge, batteryMaxEnergy - batteryCurrentEnergy)
      batteryCurrentEnergy += batteryCharge
      score += price * batteryCharge
    }
    score += price * (interval / 60) * averageConsumption
  }

  const calculateDischargeScore = (price: number, interval: number) => {
    // console.log('calculateDischargeScore ' + price.value + ' ' + interval + ' ' + score + ' ' + batteryCurrentEnergy)
    let consumption = (interval / 60) * averageConsumption

    if (batteryCurrentEnergy > 0) {
      let batteryDischarge = Math.min(batteryCurrentEnergy, consumption)
      batteryCurrentEnergy -= batteryDischarge
      consumption -= batteryDischarge
    }
    score += price * consumption
  }

  const calculateNormalScore = (price: number, interval: number) => {
    // console.log('calculateNormalScore ' + price.value + ' ' + interval + ' ' + score + ' ' + batteryCurrentEnergy)
    score += price * (interval / 60) * averageConsumption
  }

  const calculatePeriodScore = (p: Gene, calculateScore: (price: number, interval: number) => void) => {
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
  phenotype.forEach((g: Gene) => {
    nextNormalConsumptionPeriod.duration = g.start - nextNormalConsumptionPeriod.start

    calculatePeriodScore(nextNormalConsumptionPeriod, calculateNormalScore)
    switch (g.activity) {
      case Activity.Discharge:
        calculatePeriodScore(g, calculateDischargeScore)
        break
      case Activity.Charge:
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

export const generatePopulation = (endTime: number, populationSize: number, numberOfPricePeriods: number) => {
  const _sortedIndex = (array: Phenotype, value: Gene) => {
    let low = 0
    let high = array.length

    while (low < high) {
      let mid = (low + high) >>> 1
      if (array[mid].start < value.start) low = mid + 1
      else high = mid
    }
    return low
  }

  let population: Population = []
  for (let i = 0; i < populationSize; i++) {
    let phenotype: Phenotype = []
    for (let j = 0; j < numberOfPricePeriods; j++) {
      let gene: Gene = { activity: 0, start: 0, duration: 0 }
      gene.activity = Math.random() < 0.5 ? Activity.Charge : Activity.Discharge
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

const toSchedule = (p: Phenotype, start: Date): Schedule => {
  let schedule: Schedule = []
  p.forEach((g: Gene) => {
    if (g.duration > 0) {
      if (schedule.length > 0 && g.activity == schedule[schedule.length - 1].activity) {
        schedule[schedule.length - 1].duration += g.duration
      } else {
        let periodStart = new Date(start)
        periodStart.setMinutes(periodStart.getMinutes() + g.start)
        schedule.push({ start: periodStart, activity: g.activity, duration: g.duration })
      }
    }
  })
  return schedule
}

export const calculateBatteryChargingStrategy = (config: { priceData: PriceData; populationSize: number; numberOfPricePeriods: number; generations: number; mutationRate: number }) => {
  const { priceData, populationSize, numberOfPricePeriods, generations, mutationRate } = config
  // const populationSize = 20
  // const numberOfPricePeriods = 8
  // const generations = 400
  // const mutationRate = 0.03

  if (priceData == undefined || priceData.length == 0) return []

  let totalDuration = 0
  const start = new Date(priceData[0].start).valueOf()
  priceData.forEach((price: Price) => {
    const s = (new Date(price.start).valueOf() - start) / 1000 / 60
    if (s > totalDuration) totalDuration = s
  })
  totalDuration += 60

  let geneticAlgorithm = geneticAlgorithmConstructor({
    mutationFunction: mutationFunction(totalDuration, mutationRate),
    crossoverFunction: crossoverFunction(totalDuration),
    fitnessFunction: fitnessFunction(priceData, totalDuration),
    population: generatePopulation(totalDuration, populationSize, numberOfPricePeriods),
  })

  for (let i = 0; i < generations; i++) {
    geneticAlgorithm.evolve()
  }
  return toSchedule(geneticAlgorithm.best(), new Date(priceData[0].start))
}
