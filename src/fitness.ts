import type { Phenotype, TimePeriod } from './population';
import type { Node } from './schedule';

type Price = {
  start: number;
  importPrice: number;
  exportPrice: number;
  consumption: number;
  production: number;
};

export type FitnessFunctionProps = {
  input: Price[];
  batteryMaxEnergy: number;
  batteryMaxInputPower: number;
  batteryMaxOutputPower: number;
  soc: number;
  totalDuration: number;
  batteryIdleLoss: number;
};

export function* splitIntoHourIntervalsGenerator(seed: TimePeriod) {
  let remainingDuration = seed.duration ?? 0;
  let start = seed.start;
  while (remainingDuration > 0) {
    const i = Math.min(60 - (start % 60), remainingDuration);
    yield {
      start: start,
      duration: i,
      activity: seed.activity,
    };
    start += i;
    remainingDuration -= i;
  }
  return;
}

export const splitIntoHourIntervals = (seed: TimePeriod) => [
  ...splitIntoHourIntervalsGenerator(seed),
];

export function* allPeriodsGenerator(props: FitnessFunctionProps, phenotype: Phenotype) {
  const { batteryMaxEnergy, soc, totalDuration } = props;
  const { excessPvEnergyUse, periods } = phenotype;
  let currentCharge = soc * batteryMaxEnergy;

  const addCosts = (period: TimePeriod) => {
    const score = calculatePeriodScore(props, period, excessPvEnergyUse, currentCharge);
    currentCharge += score[1];
    period.cost = score[0];
    period.charge = score[1];
    return period;
  };

  if (periods.isEmpty()) {
    return;
  }

  let node: Node<TimePeriod> | null = periods.head;
  while (node) {
    const end = node.next ? node.next.data.start : totalDuration;
    const period = { ...node.data };
    period.duration = end - period.start;
    yield addCosts(period);
    node = node.next;
  }
}

export const allPeriods = (props: FitnessFunctionProps, phenotype: Phenotype) => {
  return [...allPeriodsGenerator(props, phenotype)];
};

const CHARGE = 1;

export const calculateDischargeScore = (props: Omit<CalculateIntervalScoreProps, 'activity'>) => {
  const {
    exportPrice,
    importPrice,
    consumption,
    production,
    maxDischarge,
    maxCharge,
    excessPvEnergyUse,
  } = props;

  const consumedFromProduction = Math.min(consumption, production);
  const batteryChargeFromProduction =
    excessPvEnergyUse == CHARGE ? Math.min(production - consumedFromProduction, maxCharge) : 0;
  const consumedFromBattery = Math.min(consumption - consumedFromProduction, maxDischarge);
  const soldFromProduction = production - consumedFromProduction - batteryChargeFromProduction;
  const consumedFromGrid = consumption - consumedFromProduction - consumedFromBattery;

  const cost = consumedFromGrid * importPrice - soldFromProduction * exportPrice;
  const charge = batteryChargeFromProduction - consumedFromBattery;

  return [cost, charge];
};

export const calculateNormalScore = (
  props: Omit<CalculateIntervalScoreProps, 'activity' | 'maxDischarge'>
) => {
  const {
    exportPrice,
    importPrice,
    maxCharge,
    consumption,
    production,
    excessPvEnergyUse,
    batteryIdleLoss,
  } = props;

  const consumedFromProduction = Math.min(consumption, production);
  const batteryChargeFromProduction =
    excessPvEnergyUse == CHARGE ? Math.min(production - consumedFromProduction, maxCharge) : 0;
  const soldFromProduction = production - consumedFromProduction - batteryChargeFromProduction;
  const consumedFromGrid = consumption - consumedFromProduction;

  const cost = importPrice * consumedFromGrid - exportPrice * soldFromProduction;
  const charge = batteryChargeFromProduction - batteryIdleLoss;

  return [cost, charge];
};

export const calculateChargeScore = (
  props: Omit<CalculateIntervalScoreProps, 'activity' | 'maxDischarge'>
) => {
  const { exportPrice, importPrice, consumption, production, maxCharge } = props;

  const consumedFromProduction = Math.min(consumption, production);
  const batteryChargeFromProduction = Math.min(production - consumedFromProduction, maxCharge);
  const soldFromProduction = production - consumedFromProduction - batteryChargeFromProduction;
  const consumedFromGrid = consumption - consumedFromProduction;
  const chargedFromGrid = maxCharge - batteryChargeFromProduction;

  const cost =
    (consumedFromGrid + chargedFromGrid) * importPrice - soldFromProduction * exportPrice;
  const charge = batteryChargeFromProduction + chargedFromGrid;

  return [cost, charge];
};

type CalculateIntervalScoreProps = {
  activity: number;
  importPrice: number;
  exportPrice: number;
  consumption: number;
  production: number;
  maxCharge: number;
  maxDischarge: number;
  batteryIdleLoss: number;
  excessPvEnergyUse?: number | undefined;
};

export const calculateIntervalScore = (props: CalculateIntervalScoreProps) => {
  switch (props.activity) {
    case -1:
      return calculateDischargeScore(props);
    case 1:
      return calculateChargeScore(props);
    case 0:
    default:
      return calculateNormalScore(props);
  }
};

export const calculatePeriodScore = (
  props: FitnessFunctionProps,
  period: TimePeriod,
  excessPvEnergyUse: number | undefined,
  _currentCharge: number
) => {
  const { input, batteryMaxEnergy, batteryMaxInputPower, batteryMaxOutputPower, batteryIdleLoss } =
    props;
  let cost = 0;
  let currentCharge = _currentCharge;
  for (const interval of splitIntoHourIntervals(period)) {
    const duration = interval.duration / 60;
    const maxCharge = Math.min(batteryMaxInputPower * duration, batteryMaxEnergy - currentCharge);
    const maxDischarge = Math.min(batteryMaxOutputPower * duration, currentCharge);
    const { importPrice, exportPrice, consumption, production } =
      input[Math.floor(interval.start / 60)];

    const v = calculateIntervalScore({
      activity: interval.activity,
      importPrice,
      exportPrice,
      consumption: consumption * duration,
      production: production * duration,
      maxCharge,
      maxDischarge,
      excessPvEnergyUse,
      batteryIdleLoss: batteryIdleLoss * duration,
    });
    cost += v[0];
    currentCharge += v[1];
  }
  return [cost, currentCharge - _currentCharge];
};

export const cost = (periods: TimePeriod[]) => {
  return periods.reduce((acc, cur) => acc + (cur.cost ?? 0), 0);
};

export const fitnessFunction = (props: FitnessFunctionProps) => (phenotype: Phenotype) => {
  const periods = allPeriods(props, phenotype);
  let score = -cost(periods);

  const averagePrice =
    props.input.reduce((acc, cur) => acc + cur.importPrice, 0) / props.input.length;
  score -= periods.reduce((acc, cur) => {
    if (cur.activity != 0 && cur.charge == 0 && cur.duration !== undefined)
      return acc + (cur.duration * averagePrice) / 60;
    else return acc;
  }, 0);

  return score;
};
