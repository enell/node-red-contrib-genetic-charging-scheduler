import { describe, expect, test, beforeEach } from 'vitest';
import {
  fitnessFunction,
  splitIntoHourIntervals,
  allPeriods,
  calculatePeriodScore,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
  type FitnessFunctionProps,
} from '../src/fitness';
import { DoublyLinkedList } from '../src/schedule';
import { TimePeriod } from '../src/population';
import moment from 'moment';

let props: FitnessFunctionProps;

beforeEach(() => {
  const now = moment().startOf('hour');
  const input = [
    {
      start: now.clone().add(0, 'hour').unix(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: now.clone().add(1, 'hour').unix(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: now.clone().add(2, 'hour').unix(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: now.clone().add(3, 'hour').unix(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
    {
      start: now.clone().add(4, 'hour').unix(),
      importPrice: 1,
      exportPrice: 1,
      consumption: 1,
      production: 0,
    },
  ];
  props = {
    input,
    totalDuration: input.length * 60,
    batteryMaxEnergy: 1,
    batteryMaxInputPower: 1,
    batteryMaxOutputPower: 1,
    soc: 1,
    batteryIdleLoss: 0,
  };
});

describe('Fitness - splitIntoHourIntervals', () => {
  test('should split into one intervals', () => {
    expect(splitIntoHourIntervals({ start: 0, activity: 1, duration: 60 })).toMatchObject([
      { start: 0, activity: 1, duration: 60 },
    ]);
  });

  test('should split into two intervals', () => {
    expect(splitIntoHourIntervals({ start: 0, activity: 1, duration: 90 })).toMatchObject([
      { start: 0, activity: 1, duration: 60 },
      { start: 60, activity: 1, duration: 30 },
    ]);
  });

  test('should split into hour two 30min intervals', () => {
    expect(splitIntoHourIntervals({ start: 30, activity: 1, duration: 60 })).toMatchObject([
      { start: 30, activity: 1, duration: 30 },
      { start: 60, activity: 1, duration: 30 },
    ]);
  });

  test('should split into 3 intervals', () => {
    expect(splitIntoHourIntervals({ start: 30, activity: 1, duration: 120 })).toMatchObject([
      { start: 30, activity: 1, duration: 30 },
      { start: 60, activity: 1, duration: 60 },
      { start: 120, activity: 1, duration: 30 },
    ]);
  });
});

describe('Fitness - allPeriods', () => {
  test('should test allPeriods empty', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: new DoublyLinkedList(),
      })
    ).toMatchObject([]);
  });

  test('should test allPeriods one activity', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: new DoublyLinkedList<TimePeriod>().insertBack({
          start: 0,
          activity: 1,
        }),
      })
    ).toMatchObject([{ start: 0, duration: 300, activity: 1 }]);
  });

  test('should test allPeriods many activities', () => {
    expect(
      allPeriods(props, {
        excessPvEnergyUse: 0,
        periods: new DoublyLinkedList<TimePeriod>()
          .insertBack({ start: 0, activity: 0 })
          .insertBack({ start: 70, activity: 1 })
          .insertBack({ start: 150, activity: 0 })
          .insertBack({ start: 160, activity: -1 })
          .insertBack({ start: 190, activity: 0 }),
      })
    ).toMatchObject([
      { start: 0, duration: 70, activity: 0 },
      { start: 70, duration: 80, activity: 1 },
      { start: 150, duration: 10, activity: 0 },
      { start: 160, duration: 30, activity: -1 },
      { start: 190, duration: 110, activity: 0 },
    ]);
  });
});

describe('Fitness - calculateScore', () => {
  describe('Fitness - calculateDischargeScore', () => {
    test('should discharge full hour, full battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 1,
          maxCharge: 1,
        })
      ).toEqual([0, -1]);
    });

    test('should discharge full hour, empty battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 0,
          maxCharge: 1,
        })
      ).toEqual([2, 0]);
    });

    test('should discharge full hour, almost empty battery', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxDischarge: 0.5,
          maxCharge: 1,
        })
      ).toEqual([1, -0.5]);
    });

    test('should discharge full hour, full battery, equal production', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxDischarge: 1,
          maxCharge: 1,
        })
      ).toEqual([0, 0]);
    });

    test('should discharge full hour, full battery, double production', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxDischarge: 1,
          maxCharge: 1,
        })
      ).toEqual([-2, 0]);
    });

    test('should discharge full hour, full battery, double production, charge preference', () => {
      expect(
        calculateDischargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxDischarge: 1,
          maxCharge: 1,
          excessPvEnergyUse: 1,
        })
      ).toEqual([0, 1]);
    });
  });

  describe('Fitness - calculateChargeScore', () => {
    test('should charge full hour, full battery', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 0,
        })
      ).toEqual([2, 0]);
    });

    test('should charge full hour, empty battery', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 1,
        })
      ).toEqual([4, 1]);
    });

    test('should charge full hour, almost full battery', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 0.5,
        })
      ).toEqual([3, 0.5]);
    });

    test('should charge full hour, empty battery, equal production', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxCharge: 1,
        })
      ).toEqual([2, 1]);
    });

    test('should charge full hour, empty battery, double production', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
        })
      ).toEqual([0, 1]);
    });

    test('should charge full hour, empty battery, triple production, charge preference', () => {
      expect(
        calculateChargeScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 3,
          maxCharge: 1,
          excessPvEnergyUse: 1,
        })
      ).toEqual([-2, 1]);
    });
  });

  describe('Fitness - calculateNormalScore', () => {
    test('should consume normal full hour no production', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 1,
          batteryIdleLoss: 0,
        })
      ).toEqual([2, 0]);
    });

    test('should consume normal full hour no production, battery idle loss', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 0,
          maxCharge: 1,
          batteryIdleLoss: 1,
        })
      ).toEqual([2, -1]);
    });

    test('should consume normal full hour with equal production', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 1,
          maxCharge: 1,
          batteryIdleLoss: 0,
        })
      ).toEqual([0, 0]);
    });

    test('should consume normal full hour with double production, charge preference', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          excessPvEnergyUse: 1,
          batteryIdleLoss: 0,
        })
      ).toEqual([0, 1]);
    });

    test('should consume normal full hour with double production, feed to grid preference', () => {
      expect(
        calculateNormalScore({
          importPrice: 2,
          exportPrice: 2,
          consumption: 1,
          production: 2,
          maxCharge: 1,
          excessPvEnergyUse: 0,
          batteryIdleLoss: 0,
        })
      ).toEqual([-2, 0]);
    });
  });

  describe('Fitness - calculatePeriodScore', () => {
    test('should not charge faster than max input power', () => {
      const period: TimePeriod = { start: 0, duration: 1, activity: 1 };
      const currentCharge = 0;
      const excessPvEnergyUse = 0;
      const score = calculatePeriodScore(props, period, excessPvEnergyUse, currentCharge);
      const chargeSpeed = score[1] / (1 / 60);
      expect(chargeSpeed).toBeCloseTo(props.batteryMaxInputPower);
      expect(score[0]).toBeCloseTo(2 / 60);
      expect(score[1]).toBeCloseTo(1 / 60);
    });

    test('should not discharge faster than max output power', () => {
      const period: TimePeriod = { start: 0, duration: 1, activity: -1 };
      const currentCharge = 100;
      const excessPvEnergyUse = 0;
      const score = calculatePeriodScore(props, period, excessPvEnergyUse, currentCharge);
      const dischargeSpeed = (score[1] / (1 / 60)) * -1;
      expect(dischargeSpeed).toBeCloseTo(props.batteryMaxOutputPower);
      expect(score[0]).toBeCloseTo(0);
      expect(score[1]).toBeCloseTo((1 / 60) * -1);
    });

    test('should drop in charge while idle', () => {
      props.batteryIdleLoss = 1; // 1 kWh per hour
      const period: TimePeriod = { start: 0, duration: 60, activity: 0 };
      const currentCharge = 100;
      const excessPvEnergyUse = 0;
      const score = calculatePeriodScore(props, period, excessPvEnergyUse, currentCharge);
      expect(score[0]).toBeCloseTo(1);
      expect(score[1]).toBeCloseTo(-1);
    });
  });
});

describe('Fitness', () => {
  test('should calculate fitness', () => {
    props.totalDuration = 180;
    props.soc = 0;
    const score = fitnessFunction(props)({
      periods: new DoublyLinkedList<TimePeriod>()
        .insertBack({ start: 0, activity: 0 })
        .insertBack({ start: 30, activity: 1 })
        .insertBack({ start: 90, activity: -1 })
        .insertBack({ start: 120, activity: 0 }),
      excessPvEnergyUse: 0,
    });
    expect(score).toEqual(-3.5);
  });

  test('should calculate fitness penalty for empty charge', () => {
    props.totalDuration = 180;
    props.soc = 0;
    const score1 = fitnessFunction(props)({
      periods: new DoublyLinkedList<TimePeriod>().insertBack({
        start: 0,
        activity: -1,
      }),
      excessPvEnergyUse: 0,
    });
    expect(score1).toEqual(-6);

    props.soc = 1;
    const score2 = fitnessFunction(props)({
      periods: new DoublyLinkedList<TimePeriod>().insertBack({
        start: 0,
        activity: 1,
      }),
      excessPvEnergyUse: 0,
    });
    expect(score2).toEqual(-6);
  });

  test('should calculate fitness with soc', () => {
    props.totalDuration = 120;
    props.soc = 0;
    const score = fitnessFunction(props)({
      periods: new DoublyLinkedList<TimePeriod>()
        .insertBack({ start: 0, activity: 0 })
        .insertBack({ start: 30, activity: 1 })
        .insertBack({ start: 90, activity: -1 }),
      excessPvEnergyUse: 0,
    });
    expect(score).toEqual(-2.5);
  });

  test('should calculate 180 min charge period with full battery', () => {
    props.totalDuration = 180;
    props.soc = 1;
    const now = moment().startOf('hour');
    props.input = [
      {
        start: now.clone().add(0, 'hour').unix(),
        importPrice: 1,
        exportPrice: 1,
        consumption: 1.5,
        production: 0,
      },
      {
        start: now.clone().add(1, 'hour').unix(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0,
      },
      {
        start: now.clone().add(2, 'hour').unix(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0,
      },
    ];
    const score = fitnessFunction(props)({
      periods: new DoublyLinkedList<TimePeriod>().insertBack({
        start: 0,
        activity: 1,
      }),
      excessPvEnergyUse: 0,
    });
    expect(score).toEqual(-2502.5);
  });
});
