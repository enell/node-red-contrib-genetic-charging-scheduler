const random = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const generateRandomActivity = (excludedValue) => {
  const randomArray = [-1, 0, 1].filter((val) => val !== excludedValue);
  const randomIndex = Math.floor(Math.random() * randomArray.length);
  return randomArray[randomIndex];
};

module.exports = { generateRandomActivity, random };
