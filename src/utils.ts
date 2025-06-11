import { Activity } from './population';

export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

export const generateRandomActivity = (excludedValue?: Activity) => {
  const randomArray: Activity[] = [-1, 0, 1].filter(
    (val): val is Activity => val !== excludedValue
  );
  const randomIndex = Math.floor(Math.random() * randomArray.length);
  return randomArray[randomIndex];
};
