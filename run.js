// import optimizedSchedule from './src/index.js'
// import * as optimizedSchedule from './dist/main.js'
const optimizedScheduleConstructor = require('./dist/main.js')

// const priceData = [
//   {
//     value: 2.9208,
//     start: '2022-11-26T00:00:00.000+01:00',
//   },
//   {
//     value: 2.8933,
//     start: '2022-11-26T01:00:00.000+01:00',
//   },
//   {
//     value: 2.7405,
//     start: '2022-11-26T02:00:00.000+01:00',
//   },
//   {
//     value: 2.7519,
//     start: '2022-11-26T03:00:00.000+01:00',
//   },
//   {
//     value: 2.7254,
//     start: '2022-11-26T04:00:00.000+01:00',
//   },
//   {
//     value: 2.8569,
//     start: '2022-11-26T05:00:00.000+01:00',
//   },
//   {
//     value: 2.9494,
//     start: '2022-11-26T06:00:00.000+01:00',
//   },
//   {
//     value: 3.1231,
//     start: '2022-11-26T07:00:00.000+01:00',
//   },
//   {
//     value: 3.6108,
//     start: '2022-11-26T08:00:00.000+01:00',
//   },
//   {
//     value: 3.8082,
//     start: '2022-11-26T09:00:00.000+01:00',
//   },
//   {
//     value: 3.6003,
//     start: '2022-11-26T10:00:00.000+01:00',
//   },
//   {
//     value: 3.5392,
//     start: '2022-11-26T11:00:00.000+01:00',
//   },
//   {
//     value: 3.4941,
//     start: '2022-11-26T12:00:00.000+01:00',
//   },
//   {
//     value: 3.3237,
//     start: '2022-11-26T13:00:00.000+01:00',
//   },
//   {
//     value: 3.5973,
//     start: '2022-11-26T14:00:00.000+01:00',
//   },
//   {
//     value: 3.6841,
//     start: '2022-11-26T15:00:00.000+01:00',
//   },
//   {
//     value: 4.0117,
//     start: '2022-11-26T16:00:00.000+01:00',
//   },
//   {
//     value: 4.3872,
//     start: '2022-11-26T17:00:00.000+01:00',
//   },
//   {
//     value: 4.2541,
//     start: '2022-11-26T18:00:00.000+01:00',
//   },
//   {
//     value: 3.7662,
//     start: '2022-11-26T19:00:00.000+01:00',
//   },
//   {
//     value: 3.2534,
//     start: '2022-11-26T20:00:00.000+01:00',
//   },
//   {
//     value: 2.9287,
//     start: '2022-11-26T21:00:00.000+01:00',
//   },
//   {
//     value: 2.7519,
//     start: '2022-11-26T22:00:00.000+01:00',
//   },
//   {
//     value: 2.404,
//     start: '2022-11-26T23:00:00.000+01:00',
//   },
// ]

const priceData = [
  { value: 4.0048, start: '2022-11-30T23:00:00.000Z', timeFromStart: 0 },
  { value: 3.9963, start: '2022-12-01T00:00:00.000Z', timeFromStart: 3600000 },
  { value: 3.9073, start: '2022-12-01T01:00:00.000Z', timeFromStart: 7200000 },
  { value: 3.7746, start: '2022-12-01T02:00:00.000Z', timeFromStart: 10800000 },
  { value: 3.8251, start: '2022-12-01T03:00:00.000Z', timeFromStart: 14400000 },
  { value: 3.9834, start: '2022-12-01T04:00:00.000Z', timeFromStart: 18000000 },
  { value: 4.9362, start: '2022-12-01T05:00:00.000Z', timeFromStart: 21600000 },
  { value: 6.2714, start: '2022-12-01T06:00:00.000Z', timeFromStart: 25200000 },
  { value: 6.4424, start: '2022-12-01T07:00:00.000Z', timeFromStart: 28800000 },
  { value: 6.3985, start: '2022-12-01T08:00:00.000Z', timeFromStart: 32400000 },
  { value: 6.3018, start: '2022-12-01T09:00:00.000Z', timeFromStart: 36000000 },
  { value: 6.2111, start: '2022-12-01T10:00:00.000Z', timeFromStart: 39600000 },
  { value: 6.0942, start: '2022-12-01T11:00:00.000Z', timeFromStart: 43200000 },
  { value: 6.2126, start: '2022-12-01T12:00:00.000Z', timeFromStart: 46800000 },
  { value: 6.4522, start: '2022-12-01T13:00:00.000Z', timeFromStart: 50400000 },
  { value: 6.439, start: '2022-12-01T14:00:00.000Z', timeFromStart: 54000000 },
  { value: 6.3698, start: '2022-12-01T15:00:00.000Z', timeFromStart: 57600000 },
  { value: 6.7257, start: '2022-12-01T16:00:00.000Z', timeFromStart: 61200000 },
  { value: 6.5304, start: '2022-12-01T17:00:00.000Z', timeFromStart: 64800000 },
  { value: 6.3677, start: '2022-12-01T18:00:00.000Z', timeFromStart: 68400000 },
  { value: 5.9974, start: '2022-12-01T19:00:00.000Z', timeFromStart: 72000000 },
  { value: 5.2959, start: '2022-12-01T20:00:00.000Z', timeFromStart: 75600000 },
  { value: 4.6529, start: '2022-12-01T21:00:00.000Z', timeFromStart: 79200000 },
  { value: 4.1714, start: '2022-12-01T22:00:00.000Z', timeFromStart: 82800000 },
  { value: 4.2889, start: '2022-12-01T23:00:00.000Z', timeFromStart: 86400000 },
  { value: 4.1232, start: '2022-12-02T00:00:00.000Z', timeFromStart: 90000000 },
  { value: 4.0922, start: '2022-12-02T01:00:00.000Z', timeFromStart: 93600000 },
  { value: 4.0906, start: '2022-12-02T02:00:00.000Z', timeFromStart: 97200000 },
  { value: 4.1138, start: '2022-12-02T03:00:00.000Z', timeFromStart: 100800000 },
  { value: 4.2882, start: '2022-12-02T04:00:00.000Z', timeFromStart: 104400000 },
  { value: 4.9242, start: '2022-12-02T05:00:00.000Z', timeFromStart: 108000000 },
  { value: 5.7531, start: '2022-12-02T06:00:00.000Z', timeFromStart: 111600000 },
  { value: 6.1497, start: '2022-12-02T07:00:00.000Z', timeFromStart: 115200000 },
  { value: 6.0205, start: '2022-12-02T08:00:00.000Z', timeFromStart: 118800000 },
  { value: 5.9406, start: '2022-12-02T09:00:00.000Z', timeFromStart: 122400000 },
  { value: 5.6993, start: '2022-12-02T10:00:00.000Z', timeFromStart: 126000000 },
  { value: 5.6215, start: '2022-12-02T11:00:00.000Z', timeFromStart: 129600000 },
  { value: 5.3532, start: '2022-12-02T12:00:00.000Z', timeFromStart: 133200000 },
  { value: 4.306, start: '2022-12-02T13:00:00.000Z', timeFromStart: 136800000 },
  { value: 4.0387, start: '2022-12-02T14:00:00.000Z', timeFromStart: 140400000 },
  { value: 3.9544, start: '2022-12-02T15:00:00.000Z', timeFromStart: 144000000 },
  { value: 5.1585, start: '2022-12-02T16:00:00.000Z', timeFromStart: 147600000 },
  { value: 4.5574, start: '2022-12-02T17:00:00.000Z', timeFromStart: 151200000 },
  { value: 4.2664, start: '2022-12-02T18:00:00.000Z', timeFromStart: 154800000 },
  { value: 3.5536, start: '2022-12-02T19:00:00.000Z', timeFromStart: 158400000 },
  { value: 3.8999, start: '2022-12-02T20:00:00.000Z', timeFromStart: 162000000 },
  { value: 3.7928, start: '2022-12-02T21:00:00.000Z', timeFromStart: 165600000 },
  { value: 3.4969, start: '2022-12-02T22:00:00.000Z', timeFromStart: 169200000 },
]

// const priceData = [
//   { value: 1, start: '2022-12-01T00:00:00.000Z' },
//   { value: 2, start: '2022-12-01T01:00:00.000Z' },
//   { value: 5, start: '2022-12-01T02:00:00.000Z' },
// ]

// const p = [
//   { start: 0, duration: 60, action: 1 },
//   { start: 70, duration: 120, action: -1 },
// ]
// repair(p, endTime)

// console.log(fitnessFunction(priceData, endTime)(p))
// console.log(toSchedule(p))

const populationSize = 20
const numberOfPricePeriods = 8
const generations = 400
const mutationRate = 0.03

const optimizedSchedule = optimizedScheduleConstructor({
  priceData,
  populationSize,
  numberOfPricePeriods,
  generations,
  mutationRate,
})
let schedule = optimizedSchedule.run()
console.log(schedule)
