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
  const { exportPrice, importPrice, consumption, production, maxDischarge } =
    props

  const consumedFromProduction = Math.min(consumption, production)
  const consumedFromBattery = Math.min(
    consumption - consumedFromProduction,
    maxDischarge
  )
  const soldFromProduction = production - consumedFromProduction
  const consumedFromGrid =
    consumption - consumedFromProduction - consumedFromBattery

  let cost = consumedFromGrid * importPrice - soldFromProduction * exportPrice
  let charge = consumedFromBattery

  return [cost, -charge]
}

const calculateNormalScore = (props) => {
  const { exportPrice, importPrice, maxCharge, consumption, production } = props

  const consumedFromProduction = Math.min(consumption, production)
  const batteryChargeFromProduction = Math.min(
    production - consumedFromProduction,
    maxCharge
  )
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
  const {
    totalDuration,
    priceData,
    batteryMaxEnergy,
    batteryMaxInputPower,
    averageConsumption,
    averageProduction,
    soc,
  } = props

  let score = 0
  let currentCharge = (soc / 100) * batteryMaxEnergy

  for (const interval of fillInNormalPeriodsGenerator(
    totalDuration,
    phenotype
  )) {
    const duration = interval.duration / 60
    const maxCharge = Math.min(
      batteryMaxInputPower,
      batteryMaxEnergy - currentCharge
    )
    const maxDischarge = Math.min(batteryMaxInputPower, currentCharge)
    const v = calculatePeriodScore({
      activity: interval.activity,
      importPrice: priceData[Math.floor(interval.start / 60)].value,
      exportPrice: priceData[Math.floor(interval.start / 60)].value,
      consumption: averageConsumption * duration,
      production: averageProduction * duration,
      maxCharge,
      maxDischarge,
    })
    score -= v[0]
    currentCharge += v[1]
  }

  return score
}

module.exports = {
  fitnessFunction,
  splitIntoHourIntervals,
  fillInNormalPeriods,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
}
