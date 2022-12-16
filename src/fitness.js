import {
  append,
  unfold,
  min,
  pipe,
  last,
  add,
  negate,
  identity,
  evolve,
  flatten,
  reduce,
} from 'ramda'

const end = (g) => g.start + g.duration

export const splitIntoHourIntervals = (seed) =>
  unfold((n) => {
    if (n.duration <= 0) return false
    const i = min(60 - (n.start % 60), n.duration)
    const transformations = {
      start: add(i),
      duration: add(negate(i)),
      activity: identity,
    }
    return [
      { start: n.start, duration: i, activity: n.activity },
      evolve(transformations, n),
    ]
  }, seed)

export const calculateNormalPeriod = (acc, g) =>
  splitIntoHourIntervals({
    start: end(acc),
    duration: g.start - end(acc),
    activity: 0,
  })

export const fillInNormalPeriods = (totalDuration, p) => {
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

export const calculateDischargeScore = (props) => {
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

export const calculateNormalScore = (props) => {
  const { duration, price, averageConsumption } = props
  return [price * (averageConsumption * duration), 0]
}

export const calculateChargeScore = (props) => {
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

export const fitnessFunction = (props) => (phenotype) => {
  const { totalDuration } = props

  return reduce(
    iterator(props),
    [0, 0],
    fillInNormalPeriods(totalDuration, phenotype)
  )
}
