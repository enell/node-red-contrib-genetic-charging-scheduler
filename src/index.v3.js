const printGene = props => {
  const { start, duration, action } = props
  console.log(`start:${start} duration:${duration} action:${action}`)
}

const printMember = m => {
  const { genes } = m
  genes.forEach(gene => {
    printGene(gene)
  })
}

const printPopulation = p => {
  const { members } = p
  members.forEach(m => {
    printMember(m)
    console.log(`fitness:${m.fitness}`)
    console.log()
  })
}

const random = min => max => () => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min)) + min
}

const randomAction = () => {
  return Math.random() < 0.5 ? -1 : 1
}

function population (props) {
  const generateGene = props => {
    const { randomActionGenerator, randomStartTimeGenerator } = props
    return { action: randomActionGenerator(), start: randomStartTimeGenerator(), duration: 0 }
  }

  const generateMember = props => {
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

    const generateGenes = props => {
      const { numberOfPricePeriods, randomDurationGenerator } = props

      let genes = []
      for (let i = 0; i < numberOfPricePeriods; i++) {
        const gene = generateGene(props)
        const location = _sortedIndex(genes, gene)
        genes.splice(location, 0, gene)
      }
      genes[0].start = 0

      for (let i = 0; i < genes.length - 1; i++) {
        const g = genes[i]
        g.duration = randomDurationGenerator(genes[i + 1].start - g.start)()
      }
      return genes
    }
    return { genes: generateGenes(props) }
  }

  const generatePopulation = props => {
    const { populationSize } = props
    const members = []

    for (let i = 0; i < populationSize; i++) {
      members.push(generateMember(props))
    }

    return { members }
  }

  return generatePopulation(props)
}

function ga (props) {
  const evolve = props => {
    const { population, generations } = props

    const adjustStartTime = (s1, s2) => {
      // printGene(s1)
      // printGene(s2)

      let diff = s2.start - (s1.start + s1.duration)
      // console.log(diff);
      if (diff < 0) {
        s2.start += diff
        s2.duration -= Math.min(diff, s2.duration)
      }

      // printGene(s1)
      // printGene(s2)
    }

    const fitness = props => {
      const { member } = props
      if (member.fitness) {
        return member.fitness
      }

      member.fitness = 0
      member.genes.forEach(g => {
        member.fitness += g.duration
      })

      return member.fitness
    }

    const selectParentCandidates = props => {
      const { members } = props
      const candidatePool = []

      const k = 3
      for (let i = 0; i < members.length; i++) {
        let best = members[Math.floor(Math.random() * members.length)]
        for (let j = 1; j < k; j++) {
          let m = members[Math.floor(Math.random() * members.length)]
          if (fitness({ member: m }) < fitness({ member: best })) best = m
        }
        candidatePool.push(best)
      }

      return candidatePool
    }

    const crossover = props => {
      const { parentA, parentB } = props
      const midpoint = random(0)(parentA.genes.length)()
      const childGenes = []
      for (let i = 0; i < parentA.genes.length; i++) {
        if (i <= midpoint) {
          childGenes[i] = parentA.genes[i]
        } else {
          childGenes[i] = parentB.genes[i]
        }
      }

      console.log(midpoint);
      printMember({genes:childGenes})

      if (midpoint>0) {
        adjustStartTime(childGenes[midpoint-1], childGenes[midpoint])
      }
      return { genes:childGenes }
    }

    const mutate = props => {
      const { mutationRate, member } = props
      return member
    }

    const reproduce = props => {
      const { parentCandidates, population } = props

      for (let i = 0; i < population.members.length; i += 1) {
        const parentA = parentCandidates[random(0)(parentCandidates.length)()]
        const parentB = parentCandidates[random(0)(parentCandidates.length)()]

        // Perform crossover
        const child = crossover({ parentA, parentB })

        // Perform mutation
        mutate({ mutationRate, child })

        fitness({ member: child })
        population.members[i] = child
      }

      return population
    }

    for (let i = 0; i < generations; i++) {
      const parentCandidates = selectParentCandidates(population)
      reproduce({ parentCandidates, population })
      // printPopulation({ members: parentCandidates })
    }

    return population
  }

  const bestMember = population => {
    return population[0]
  }

  return bestMember(evolve(props))
}

const populationSize = 2
const numberOfPricePeriods = 10
const generations = 1000
const mutationRate = 0.05

const endTime = 100
const populationProps = {
  populationSize: populationSize,
  numberOfPricePeriods: numberOfPricePeriods,
  randomActionGenerator: randomAction,
  randomStartTimeGenerator: random(0)(endTime),
  randomDurationGenerator: random(0),
}

const gaProps = {
  generations: 10,
  population: population(populationProps),
}

const bestMember = ga(gaProps)
// console.log(bestMember)
