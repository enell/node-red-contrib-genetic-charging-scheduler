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

const populationSize = 50
const maxNumberOfPricePeriods = 14
const pricePeriodDuration = 15
const generations = 200
const mutationRate = 0.02

function random (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)

  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min
}

function randomAction () {
  return random(-1, 2)
}

class Member {
  constructor (pricePeriodDuration, maxNumberOfPricePeriods, priceData) {
    this.pricePeriodDuration = pricePeriodDuration
    this.maxNumberOfPricePeriods = maxNumberOfPricePeriods
    this.priceData = priceData
    this.pricePeriods = []
  }

  static createClone (m) {
    return new Member(m.pricePeriodDuration, m.maxNumberOfPricePeriods, m.priceData)
  }

  generatePricePeriods (numberOfPricePeriods) {
    this.pricePeriods = []
    for (let i = 0; i < numberOfPricePeriods; i++) {
      this.pricePeriods[i] = randomAction()
    }
  }

  fitness () {
    const averageConsumption = 1.25
    const batteryTotalCapacity = 5
    const batteryChargeRate = 2.4

    let batteryCurrentCapacity = 0
    let totalCost = 0
    let numberOfChargeDischargePeriods = 0
    this.pricePeriods.forEach((p, i) => {
      const hour = Math.floor((i * this.pricePeriodDuration) / 60)
      const duration = this.pricePeriodDuration / 60
      const weightedPrice = Math.pow(this.priceData[hour].value, 2)

      let periodCost = 0
      let capacityCost = 0
      let consumptionFromGrid = duration * averageConsumption
      switch (p) {
        case 1:
          // charge battery
          // cost consumption and battery charge
          // increase battery soc
          capacityCost = Math.min(duration * batteryChargeRate, batteryTotalCapacity - batteryCurrentCapacity)

          periodCost = consumptionFromGrid * weightedPrice
          periodCost += duration * batteryChargeRate * weightedPrice

          numberOfChargeDischargePeriods++
          break
        case 0:
          // idle
          // cost consumption
          periodCost = consumptionFromGrid * weightedPrice

          break
        case -1:
          // discharge battery
          // cost consumption outside of battery discharge
          // decrease battery soc
          let consumptionFromBattery = Math.min(consumptionFromGrid, batteryCurrentCapacity)
          capacityCost = -1 * consumptionFromBattery

          consumptionFromGrid = consumptionFromGrid - consumptionFromBattery
          periodCost = consumptionFromGrid * weightedPrice

          numberOfChargeDischargePeriods++
          break
        default:
          break
      }

      totalCost += periodCost
      batteryCurrentCapacity += capacityCost
      // console.log(`${i} ${p} cost ${periodCost} price ${price} batteryConsumption ${capacityCost} battery ${batteryCurrentCapacity}`);
    })
    totalCost *= Math.max(1, numberOfChargeDischargePeriods - this.maxNumberOfPricePeriods)
    return totalCost
  }

  crossover (partner) {
    const { length } = this.pricePeriods
    const childPricePeriods = []
    const midpoint = random(0, length)

    for (let i = 0; i < length; i += 1) {
      if (i > midpoint) {
        childPricePeriods.push(this.pricePeriods[i])
      } else {
        childPricePeriods.push(partner.pricePeriods[i])
      }
    }

    let child = Member.createClone(this)
    child.pricePeriods = childPricePeriods
    return child
  }

  mutate (mutationRate) {
    for (let i = 0; i < this.pricePeriods.length; i += 1) {
      // If below predefined mutation rate,
      // generate a new random letter on this position.
      if (Math.random() < mutationRate) {
        let newAction = this.pricePeriods[i]
        while (newAction == this.pricePeriods[i]) {
          newAction = randomAction()
        }

        let pool = [newAction]
        switch (i) {
          case 0:
            pool.push(this.pricePeriods[1])
            pool.push(this.pricePeriods[1])
            break;
          case this.pricePeriods.length-1:
            pool.push(this.pricePeriods[i-1])
            pool.push(this.pricePeriods[i-1])
            break
          default:
            pool.push(this.pricePeriods[i+1])
            pool.push(this.pricePeriods[i-1])
            break;
        }
        this.pricePeriods[i] = pool[Math.floor(Math.random()*pool.length)]
      }
    }
  }

  toSchedule () {
    let schedule = []
    this.pricePeriods.forEach((p, i) => {
      let start = new Date(priceData[0].start)
      start.setMinutes(priceData[0].start.getMinutes() + i * this.pricePeriodDuration)

      if (i > 0 && p == schedule[schedule.length - 1].chargeDischarge) {
        schedule[schedule.length - 1].duration += this.pricePeriodDuration
      } else {
        schedule.push({ start: start, chargeDischarge: p, duration: this.pricePeriodDuration })
      }
    })
    return schedule
  }
}

class Population {
  constructor (pricePeriodDuration, maxNumberOfPricePeriods, priceData, populationSize, mutationRate) {
    populationSize = populationSize || 1
    this.members = []
    this.priceData = priceData
    this.mutationRate = mutationRate

    let numberOfPricePeriods = Math.floor(this._findEndTime(priceData) / pricePeriodDuration)
    for (let i = 0; i < populationSize; i += 1) {
      let member = new Member(pricePeriodDuration, maxNumberOfPricePeriods, priceData)
      member.generatePricePeriods(numberOfPricePeriods)
      this.members.push(member)
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
        // find member with smallest fitness i.e lowest cost
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

      this.members[i] = child
    }
  }

  _findEndTime (priceData) {
    var startTime = priceData[0].start
    var endTime = priceData[priceData.length - 1].start

    return (endTime - startTime) / 1000 / 60 + 60
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

    // console.log()
    console.log(`min ${fMinMember.fitness()}  average ${fSum / this.members.length}`)
    // console.log(fMinMember.pricePeriods)
  }
}

priceData.forEach(price => {
  price.start = new Date(price.start)
  price.timeFromStart = price.start - priceData[0].start
})

const population = new Population(pricePeriodDuration, maxNumberOfPricePeriods, priceData, populationSize, mutationRate)
let bestMember = population.evolve(generations)



console.log(bestMember.toSchedule())

// const m = new Member(pricePeriodDuration, maxNumberOfPricePeriods, priceData)
// let n = priceData.length*(60/pricePeriodDuration)
// console.log(n);
// // m.generatePricePeriods(n)
// m.pricePeriods = [
//   0, -1,  1,  0,  1, -1,  0,  0,
//  -1, -1, -1,  0,  0,  1,  0,  0,
//   0, -1, -1, -1, -1,  0, -1, -1
// ]
// console.log(m.pricePeriods);
// console.log(m.fitness());
