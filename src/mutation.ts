import type { Node } from './schedule';
import type { Phenotype, TimePeriod } from './population';
import { generateRandomActivity, random } from './utils';

type mutationFunctionProps = {
  totalDuration: number;
  mutationRate: number;
};

export const mutationFunction = (props: mutationFunctionProps) => (phenotype: Phenotype) => {
  const { totalDuration, mutationRate } = props;

  const timeAdjustment = (low: number, mid: number, high: number) => {
    return random(0.1 * (low - mid), 0.1 * (high - mid));
  };

  return {
    periods: phenotype.periods.map((gene: TimePeriod, node: Node<TimePeriod>) => {
      const g = { ...gene };
      if (Math.random() < mutationRate) {
        // Mutate action
        g.activity = generateRandomActivity(gene.activity);
      }

      if (gene.start > 0 && Math.random() < mutationRate) {
        g.start += timeAdjustment(
          node.previous!.data.start + 1,
          gene.start,
          node.next ? node.next.data.start : totalDuration
        );
      }
      return g;
    }),
    excessPvEnergyUse: phenotype.excessPvEnergyUse,
  };
};
