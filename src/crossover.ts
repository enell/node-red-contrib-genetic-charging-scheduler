import type { Phenotype, TimePeriod } from './population';
import { DoublyLinkedList } from './schedule';
import { random } from './utils';

type CrossoverFunctionProps = {
  totalDuration: number;
};

export const crossoverFunction =
  (props: CrossoverFunctionProps) =>
  (phenotypeA: Phenotype, phenotypeB: Phenotype): [Phenotype] | [Phenotype, Phenotype] => {
    const { totalDuration } = props;
    const midpoint = random(0, totalDuration);
    const childGenes = new DoublyLinkedList<TimePeriod>();

    phenotypeA.periods.reduce((acc, data) => {
      if (data.start <= midpoint) {
        acc.insertBack(data);
      }
      return acc;
    }, childGenes);

    phenotypeB.periods.reduce((acc, data) => {
      if (data.start > midpoint) {
        acc.insertBack(data);
      }
      return acc;
    }, childGenes);

    return [
      {
        periods: childGenes,
        excessPvEnergyUse:
          Math.random() < 0.5 ? phenotypeA.excessPvEnergyUse : phenotypeB.excessPvEnergyUse,
      },
    ];
  };
