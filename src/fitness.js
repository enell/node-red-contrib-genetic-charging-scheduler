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

const end = (g) => g.start + g.duration

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
    if (normalPeriod.duration > 0) yield normalPeriod
    yield p[i]
  }

  const normalPeriod = calculateNormalPeriod(
    p.at(-1) ?? { start: 0, duration: 0 },
    {
      start: totalDuration,
    }
  )
  if (normalPeriod.duration > 0) yield normalPeriod
}

const fillInNormalPeriods = (totalDuration, p) => {
  return [...fillInNormalPeriodsGenerator(totalDuration, p)]
}

const FEED_TO_GRID = 0
const CHARGE = 1

const calculateDischargeScore = (props) => {
  const {
    exportPrice,
    importPrice,
    consumption,
    production,
    maxDischarge,
    maxCharge,
    excessPvEnergyUse,
  } = props

  const consumedFromProduction = Math.min(consumption, production)
  const batteryChargeFromProduction =
    excessPvEnergyUse == CHARGE
      ? Math.min(production - consumedFromProduction, maxCharge)
      : 0
  const consumedFromBattery = Math.min(
    consumption - consumedFromProduction,
    maxDischarge
  )
  const soldFromProduction =
    production - consumedFromProduction - batteryChargeFromProduction
  const consumedFromGrid =
    consumption - consumedFromProduction - consumedFromBattery

  let cost = consumedFromGrid * importPrice - soldFromProduction * exportPrice
  let charge = batteryChargeFromProduction - consumedFromBattery

  return [cost, charge]
}

const calculateNormalScore = (props) => {
  const {
    exportPrice,
    importPrice,
    maxCharge,
    consumption,
    production,
    excessPvEnergyUse,
  } = props

  const consumedFromProduction = Math.min(consumption, production)
  const batteryChargeFromProduction =
    excessPvEnergyUse == CHARGE
      ? Math.min(production - consumedFromProduction, maxCharge)
      : 0
  const soldFromProduction =
    production - consumedFromProduction - batteryChargeFromProduction
  const consumedFromGrid = consumption - consumedFromProduction

  let cost = importPrice * consumedFromGrid - exportPrice * soldFromProduction
  let charge = batteryChargeFromProduction
  return [cost, charge]
}

const calculateChargeScore = (props) => {
  const { exportPrice, importPrice, consumption, production, maxCharge } = props

  const consumedFromProduction = Math.min(consumption, production)
  const batteryChargeFromProduction = Math.min(
    production - consumedFromProduction,
    maxCharge
  )
  const soldFromProduction =
    production - consumedFromProduction - batteryChargeFromProduction
  const consumedFromGrid = consumption - consumedFromProduction
  const chargedFromGrid = maxCharge - batteryChargeFromProduction

  let cost =
    (consumedFromGrid + chargedFromGrid) * importPrice -
    soldFromProduction * exportPrice
  let charge = batteryChargeFromProduction + chargedFromGrid

  return [cost, charge]
}

const calculateIntervalScore = (props) => {
  switch (props.activity) {
    case -1:
      return calculateDischargeScore(props)
    case 1:
      return calculateChargeScore(props)
    default:
      return calculateNormalScore(props)
  }
}

const calculatePeriodScore = (props, period, _currentCharge) => {
  const { input, batteryMaxEnergy, batteryMaxInputPower, excessPvEnergyUse } =
    props
  let cost = 0
  let currentCharge = _currentCharge
  for (const interval of splitIntoHourIntervals(period)) {
    const duration = interval.duration / 60
    const maxCharge = Math.min(
      batteryMaxInputPower,
      batteryMaxEnergy - currentCharge
    )
    const maxDischarge = Math.min(batteryMaxInputPower, currentCharge)
    const { importPrice, exportPrice, consumption, production } =
      input[Math.floor(interval.start / 60)]

    const v = calculateIntervalScore({
      activity: interval.activity,
      importPrice,
      exportPrice,
      consumption: consumption * duration,
      production: production * duration,
      maxCharge,
      maxDischarge,
      excessPvEnergyUse: excessPvEnergyUse,
    })
    cost += v[0]
    currentCharge += v[1]
  }
  return [cost, currentCharge - _currentCharge]
}

const fitnessFunction = (props) => (phenotype) => {
  const { totalDuration, batteryMaxEnergy, soc } = props

  let cost = 0
  let currentCharge = soc * batteryMaxEnergy

  for (const period of fillInNormalPeriodsGenerator(
    totalDuration,
    phenotype.periods
  )) {
    const score = calculatePeriodScore(props, period, currentCharge)
    cost -= score[0]
    currentCharge += score[1]
  }

  return cost
}

module.exports = {
  fitnessFunction,
  splitIntoHourIntervals,
  fillInNormalPeriodsGenerator,
  fillInNormalPeriods,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
}
