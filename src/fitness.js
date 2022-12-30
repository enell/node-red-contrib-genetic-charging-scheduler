const { append, pipe, last, flatten, reduce } = require('ramda')

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

const calculateNormalPeriod = (acc, g) =>
  splitIntoHourIntervals({
    start: end(acc),
    duration: g.start - end(acc),
    activity: 0,
  })

const fillInNormalPeriods = (totalDuration, p) => {
  return pipe(
    reduce(
      (acc, n) => [
        ...acc,
        ...calculateNormalPeriod(
          acc.at(-1) ?? { start: 0, duration: 0, activity: 0 },
          n
        ),
        ...splitIntoHourIntervals(n),
      ],
      []
    ),
    append(
      calculateNormalPeriod(last(p) ?? { start: 0, duration: 0 }, {
        start: totalDuration,
      })
    ),
    flatten
  )(p)
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

const iterator = (props) => (acc, period) => {
  const v = calculatePeriodScore({
    activity: period.activity,
    price: props.priceData[Math.floor(period.start / 60)].value,
    duration: period.duration / 60,
    currentCharge: acc[1],
    totalDuration: props.totalDuration,
    batteryCapacity: props.batteryCapacity,
    batteryMaxInputPower: props.batteryMaxInputPower,
    averageConsumption: props.averageConsumption,
  })
  acc[0] -= v[0]
  acc[1] += v[1]
  return acc
}

const fitnessFunction = (props) => (phenotype) => {
  const { totalDuration } = props

  return reduce(
    iterator(props),
    [0, 0],
    fillInNormalPeriods(totalDuration, phenotype)
  )
}

module.exports = {
  fitnessFunction,
  splitIntoHourIntervals,
  fillInNormalPeriods,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
}
