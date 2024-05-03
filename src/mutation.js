const { generateRandomActivity, random } = require('./utils');

const mutationFunction = (props) => (phenotype) => {
  const { totalDuration, mutationRate } = props;

  const timeAdjustment = (low, mid, high) => {
    return random(0.1 * (low - mid), 0.1 * (high - mid));
  };

  for (let i = 0; i < phenotype.periods.length; i += 1) {}
  return {
    periods: phenotype.periods.map((gene, node) => {
      const g = { ...gene };
      if (Math.random() < mutationRate) {
        // Mutate action
        g.activity = generateRandomActivity(gene.activity);
      }

      if (gene.start > 0 && Math.random() < mutationRate) {
        g.start += timeAdjustment(
          node.previous.data.start + 1,
          gene.start,
          node.next ? node.next.data.start : totalDuration
        );
      }
      return g;
    }),
    excessPvEnergyUse: phenotype.excessPvEnergyUse,
  };
};

module.exports = {
  mutationFunction,
};
