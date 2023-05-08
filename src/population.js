const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

const randomAction = () => {
  switch (random(0, 3)) {
    case 0: return 1
    case 1: return -1
    case 2: return -2
  }
}

const generatePopulation = (props) => {
  const {
    totalDuration,
    populationSize,
    numberOfPricePeriods,
    excessPvEnergyUse,
  } = props

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
      gene.activity = randomAction()
      gene.start = random(0, totalDuration)
      gene.duration = 0
      const location = sortedIndex(timePeriods, gene)
      timePeriods.splice(location, 0, gene)
    }

    for (let j = 0; j < timePeriods.length - 1; j += 1) {
      const maxDuration = timePeriods[j + 1].start - timePeriods[j].start
      timePeriods[j].duration = random(0, maxDuration)
    }
    const maxDuration =
      totalDuration - timePeriods[timePeriods.length - 1].start
    timePeriods[timePeriods.length - 1].duration = random(0, maxDuration)

    population.push({
      periods: timePeriods,
      excessPvEnergyUse: excessPvEnergyUse,
    })
  }
  return population
}

module.exports = {
  random,
  randomAction,
  generatePopulation
}
