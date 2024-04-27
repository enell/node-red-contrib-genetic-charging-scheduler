const { DoublyLinkedList } = require('./schedule');
const { random } = require('./utils');

const crossoverFunction = (props) => (phenotypeA, phenotypeB) => {
  const { totalDuration } = props;
  const midpoint = random(0, totalDuration);
  const childGenes = new DoublyLinkedList();

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
        Math.random() < 0.5
          ? phenotypeA.excessPvEnergyUse
          : phenotypeB.excessPvEnergyUse,
    },
  ];
};

module.exports = { crossoverFunction };
