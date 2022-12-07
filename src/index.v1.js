const priceData = [
  {
    value: 2.9208,
    start: '2022-11-26T00:00:00.000+01:00',
  },
  {
    value: 2.8933,
    start: '2022-11-26T01:00:00.000+01:00',
  },
  {
    value: 2.7405,
    start: '2022-11-26T02:00:00.000+01:00',
  },
  {
    value: 2.7519,
    start: '2022-11-26T03:00:00.000+01:00',
  },
  {
    value: 2.7254,
    start: '2022-11-26T04:00:00.000+01:00',
  },
  {
    value: 2.8569,
    start: '2022-11-26T05:00:00.000+01:00',
  },
  {
    value: 2.9494,
    start: '2022-11-26T06:00:00.000+01:00',
  },
  {
    value: 3.1231,
    start: '2022-11-26T07:00:00.000+01:00',
  },
  {
    value: 3.6108,
    start: '2022-11-26T08:00:00.000+01:00',
  },
  {
    value: 3.8082,
    start: '2022-11-26T09:00:00.000+01:00',
  },
  {
    value: 3.6003,
    start: '2022-11-26T10:00:00.000+01:00',
  },
  {
    value: 3.5392,
    start: '2022-11-26T11:00:00.000+01:00',
  },
  {
    value: 3.4941,
    start: '2022-11-26T12:00:00.000+01:00',
  },
  {
    value: 3.3237,
    start: '2022-11-26T13:00:00.000+01:00',
  },
  {
    value: 3.5973,
    start: '2022-11-26T14:00:00.000+01:00',
  },
  {
    value: 3.6841,
    start: '2022-11-26T15:00:00.000+01:00',
  },
  {
    value: 4.0117,
    start: '2022-11-26T16:00:00.000+01:00',
  },
  {
    value: 4.3872,
    start: '2022-11-26T17:00:00.000+01:00',
  },
  {
    value: 4.2541,
    start: '2022-11-26T18:00:00.000+01:00',
  },
  {
    value: 3.7662,
    start: '2022-11-26T19:00:00.000+01:00',
  },
  {
    value: 3.2534,
    start: '2022-11-26T20:00:00.000+01:00',
  },
  {
    value: 2.9287,
    start: '2022-11-26T21:00:00.000+01:00',
  },
  {
    value: 2.7519,
    start: '2022-11-26T22:00:00.000+01:00',
  },
  {
    value: 2.404,
    start: '2022-11-26T23:00:00.000+01:00',
  },
]

const populationSize = 20
const numberOfPricePeriods = 10
const generations = 1000
const mutationRate = 0.05

function random (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)

  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min
}

class PricePeriod {
  constructor () {
    this.start = 0
    this.duration = 0
    this.action = 0
  }
}



class Member {
  constructor (size, priceData) {
    this.pricePeriods = []
    this.priceData = priceData

    for (let i = 0; i < size; i++) {
      this.pricePeriods[i] = new PricePeriod(this._findEndTime())
    }
    this.sortPricePeriods()
  }

  fitness () {
    const consumption = 1
    const batteryCapacity = 5
    const batteryCharge = 2.5

    let batterySoC = 0
    let price = 0.0

    this.pricePeriods.forEach((p, i) => {
      const nextPricePeriod = this.pricePeriods[i + 1]
      let start = p.start
      let duration = (nextPricePeriod === undefined ? this._findEndTime() : nextPricePeriod.start) - p.start

      const buckets = _splitIntoHourBuckets(start, duration)
      buckets.forEach(bucket => {
        let priceCost = 0
        let socCost = 0
        const hour = Math.floor(bucket[0] / 60)
        const consumptionThisBucket = consumption * (bucket[1] / 60)
        const weightedPrice = Math.pow(this.priceData[hour].value, 2)

        switch (p.action) {
          case 1:
            // charge battery
            // cost consumption and battery charge
            // increase battery soc
            priceCost = weightedPrice * consumptionThisBucket

            let batteryChargeConsumption = batteryCharge * (bucket[1] / 60)
            let batteryChargeIncrease = Math.min(batteryChargeConsumption / batteryCapacity, 1.0 - batterySoC)
            priceCost += weightedPrice * batteryChargeConsumption

            socCost = batteryChargeIncrease
            if (socCost == 0) {
              // charging with no increase penalty
              priceCost *= 1.5
            }

            break
          case 0:
            // idle
            // cost consumption
            priceCost = weightedPrice * consumptionThisBucket
            socCost = 0
            break
          case -1:
            // discharge battery
            // cost consumption outside of battery discharge
            // decrease battery soc
            // let batteryChargeDecrease = Math.min(consumption / batteryCapacity, batterySoC)
            // const energyFromBattery = batteryCapacity * batteryChargeDecrease
            let consumptionFromBattery = Math.min(consumptionThisBucket, batterySoC * batteryCapacity)
            priceCost = weightedPrice * (consumptionThisBucket - consumptionFromBattery)

            socCost = (consumptionFromBattery / batteryCapacity) * -1

            if (socCost == 0) {
              // discharging with no decrease penalty
              priceCost *= 1.5
            }
            break
          default:
            break
        }
        // console.log(`${p[1]} price cost ${priceCost}  soc cost ${socCost}`);
        price += priceCost
        batterySoC += socCost
      })
    })
    return price

    function _splitIntoHourBuckets (start, duration) {
      let buckets = []
      let s = start
      let d = duration

      while (d > 0) {
        let bucket = []
        if (s % 60 != 0) {
          bucket = [s, 60 - (s % 60)]
        } else {
          bucket = [s, Math.min(60, d)]
        }
        buckets.push(bucket)
        s += bucket[1]
        d -= bucket[1]
      }
      return buckets
    }
  }

  crossover (partner) {
    const { length } = this.pricePeriods
    const child = new Member(0, this.priceData)
    const midpoint = random(0, length)

    for (let i = 0; i < length; i += 1) {
      if (i > midpoint) {
        child.pricePeriods[i] = this.pricePeriods[i]
      } else {
        child.pricePeriods[i] = partner.pricePeriods[i]
      }
    }

    return child
  }

  mutate (mutationRate) {
    for (let i = 0; i < this.pricePeriods.length; i += 1) {
      // If below predefined mutation rate,
      // generate a new random letter on this position.
      if (Math.random() < mutationRate) {
        this.pricePeriods[i] = new PricePeriod(this._findEndTime())
      }
    }
    this.pricePeriods[0].start = 0
  }

  sortPricePeriods () {
    this.pricePeriods = this.pricePeriods.sort((a, b) => a.start - b.start)
  }

  toSchedule() {
    let schedule = []
    this.pricePeriods.forEach((p, i) => {
      const nextPricePeriod = bestMember.pricePeriods[i + 1]
      let duration = (nextPricePeriod === undefined ? bestMember._findEndTime() : nextPricePeriod.start) - p.start
      let start = new Date(priceData[0].start)
      start.setMinutes(priceData[0].start.getMinutes() + p.start);
      if (duration > 0) {
        if (i > 0 && p.action == schedule[schedule.length-1].chargeDischarge) {
          schedule[schedule.length-1].duration += duration
        } else {
          schedule.push({ start: start, chargeDischarge: p.action, duration: duration })
        }
      }
    })
    return schedule
  }

  _findEndTime () {
    var startTime = this.priceData[0].start
    var endTime = this.priceData[0].start
    this.priceData.forEach(e => {
      var t = e.start
      if (t > endTime) endTime = t
      if (t < startTime) startTime = t
    })

    return (endTime - startTime) / 1000 / 60 + 60
  }
}

class Population {
  constructor (populationSize, numberOfPricePeriods, priceData, mutationRate) {
    populationSize = populationSize || 1
    this.members = []
    this.priceData = priceData
    this.mutationRate = mutationRate

    for (let i = 0; i < populationSize; i += 1) {
      this.members.push(new Member(numberOfPricePeriods, priceData))
    }
  }

  evolve (generations) {
    for (let i = 0; i < generations; i += 1) {
      const pool = this._selectMembersForMating()
      this._reproduce(pool)

      this.printFitness()
    }

    return this.bestMember()
  }

  _selectMembersForMating () {
    const matingPool = []

    const k = 3
    for (let i = 0; i < this.members.length; i++) {
      let best = this.members[Math.floor(Math.random() * this.members.length)]
      for (let j = 1; j < k; j++) {
        let m = this.members[Math.floor(Math.random() * this.members.length)]
        if (m.fitness() < best.fitness()) best = m
      }
      matingPool.push(best)
    }

    return matingPool
  }

  _reproduce (matingPool) {
    for (let i = 0; i < this.members.length; i += 1) {
      // Pick 2 random members/parent from the mating pool
      const parentA = matingPool[random(0, matingPool.length)]
      const parentB = matingPool[random(0, matingPool.length)]

      // Perform crossover
      const child = parentA.crossover(parentB)

      // Perform mutation
      child.mutate(this.mutationRate)

      child.sortPricePeriods()

      this.members[i] = child
    }
  }

  bestMember () {
    let fMinMember = this.members[0]
    let fMin = fMinMember.fitness()
    this.members.forEach(m => {
      let f = m.fitness()
      if (f < fMin) {
        fMin = f
        fMinMember = m
      }
    })
    return fMinMember
  }

  print () {
    this.members.forEach(e => {
      console.log(e.pricePeriods)
    })
  }

  printFitness () {
    let fSum = 0
    let fMinMember = this.members[0]
    let fMin = fMinMember.fitness()
    this.members.forEach(m => {
      let f = m.fitness()
      if (f < fMin) {
        fMin = f
        fMinMember = m
      }
      fSum += f
    })

    console.log()
    console.log(`min ${fMinMember.fitness()}  average ${fSum / this.members.length}`)
    console.log(fMinMember.pricePeriods)
  }
}

priceData.forEach(price => {
  price.start = new Date(price.start)
  price.timeFromStart = price.start - priceData[0].start
})

const population = new Population(populationSize, numberOfPricePeriods, priceData, mutationRate)
let bestMember = population.evolve(generations)

console.log(bestMember.toSchedule());
