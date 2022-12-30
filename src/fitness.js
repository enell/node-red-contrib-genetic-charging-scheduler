const end = (g) => g.start + g.duration

function* splitIntoHourIntervalsGenerator(seed) {
  let remainingDuration = seed.duration
  let start = seed.start
  while (remainingDuration > 0) {
    const i = Math.min(60 - (start % 60), remainingDuration)
    yield {
      start: start,
      duration: i,
      activity: seed.activity,
    }
    start += i
    remainingDuration -= i
  }
  return
}

const splitIntoHourIntervals = (seed) => [
  ...splitIntoHourIntervalsGenerator(seed),
]

const calculateNormalPeriod = (g1, g2) => {
  return {
    start: end(g1),
    duration: g2.start - end(g1),
    activity: 0,
  }
}

function* fillInNormalPeriodsGenerator(totalDuration, p) {
  for (let i = 0; i < p.length; i += 1) {
    const normalPeriod = calculateNormalPeriod(
      p[i - 1] ?? { start: 0, duration: 0 },
      p[i]
    )
    for (const interval of splitIntoHourIntervalsGenerator(normalPeriod)) {
      yield interval
    }
    for (const interval of splitIntoHourIntervalsGenerator(p[i])) {
      yield interval
    }
  }
  const normalPeriod = calculateNormalPeriod(
    p.at(-1) ?? { start: 0, duration: 0 },
    { start: totalDuration }
  )
  for (const interval of splitIntoHourIntervalsGenerator(normalPeriod)) {
    yield interval
  }
}

const fillInNormalPeriods = (totalDuration, p) => {
  return [...fillInNormalPeriodsGenerator(totalDuration, p)]
}

const calculateDischargeScore = (props) => {
  const { duration, price, averageConsumption, currentCharge } = props
  let cost = 0
  let discharge = averageConsumption * duration
  const overDischarge = currentCharge - discharge
  if (overDischarge < 0) {
    discharge += overDischarge

    // apply cost for energy that is covered from the grid
    cost += -overDischarge * price

    // apply penalty for over discharging
  }

  return [cost, -discharge]
}

const calculateNormalScore = (props) => {
  const { duration, price, averageConsumption } = props
  return [price * (averageConsumption * duration), 0]
}

const calculateChargeScore = (props) => {
  const {
    duration,
    price,
    batteryMaxInputPower,
    averageConsumption,
    currentCharge,
    batteryCapacity,
  } = props
  let cost = price * (averageConsumption * duration)

  let charge = batteryMaxInputPower * duration
  const overCharge = currentCharge + charge - batteryCapacity
  if (overCharge > 0) {
    charge -= overCharge
    // apply penalty for overcharge
  }
  cost += price * charge
  return [cost, charge]
}

const calculatePeriodScore = (props) => {
  switch (props.activity) {
    case -1:
      return calculateDischargeScore(props)
    case 1:
      return calculateChargeScore(props)
    default:
      return calculateNormalScore(props)
  }
}

const fitnessFunction = (props) => (phenotype) => {
  const { totalDuration } = props

  let acc = [0, 0]

  for (const interval of fillInNormalPeriodsGenerator(
    totalDuration,
    phenotype
  )) {
    const v = calculatePeriodScore({
      activity: interval.activity,
      price: props.priceData[Math.floor(interval.start / 60)].value,
      duration: interval.duration / 60,
      currentCharge: acc[1],
      totalDuration: props.totalDuration,
      batteryCapacity: props.batteryCapacity,
      batteryMaxInputPower: props.batteryMaxInputPower,
      averageConsumption: props.averageConsumption,
    })
    acc[0] -= v[0]
    acc[1] += v[1]
  }

  return acc[0]
}

module.exports = {
  fitnessFunction,
  splitIntoHourIntervals,
  fillInNormalPeriods,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
}
