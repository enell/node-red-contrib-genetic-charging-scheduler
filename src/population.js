const { generateRandomActivity } = require('./utils');
const { DoublyLinkedList } = require('./schedule');

const populationFunction = (props) => {
  const {
    totalDuration,
    populationSize,
    numberOfPricePeriods,
    excessPvEnergyUse,
  } = props;

  const population = [];
  for (let i = 0; i < populationSize; i += 1) {
    const timePeriods = new DoublyLinkedList();
    const activities = [];
    let currentNumberOfPricePeriods = 0;
    let previousActivity = undefined;
    while (currentNumberOfPricePeriods < numberOfPricePeriods) {
      const activity = generateRandomActivity(previousActivity);
      currentNumberOfPricePeriods += activity != 0;
      activities.push(activity);
      previousActivity = activity;
    }

    const startTimes = new Set();
    startTimes.add(0);
    while (startTimes.size < activities.length) {
      startTimes.add(Math.floor(Math.random() * totalDuration));
    }
    Array.from(startTimes)
      .sort((a, b) => a - b)
      .forEach((start, i) =>
        timePeriods.insertBack({ start, activity: activities[i] })
      );

    population.push({
      periods: timePeriods,
      excessPvEnergyUse: excessPvEnergyUse,
    });
  }
  return population;
};

module.exports = {
  populationFunction,
};
