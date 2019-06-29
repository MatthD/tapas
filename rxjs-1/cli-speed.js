'use strict'

/**
 * External dependencies
 */
const kuler = require('kuler');
const { fromEvent, merge } = require('rxjs');
const { map, filter, timeout, takeUntil } = require('rxjs/operators');

/**
 * Internal dependencies
 */
const { Race, getRace } = require('./race');


const maxTimeout = timeout(1000);
const race = getRace();
const carName = 'Lightning McQueen';
const speed$ = getCarSpeed(race, carName);

let subs = speed$.subscribe({
  next: (speed) => {
    if (isNaN(speed)) return;
    process.stdout.write(`Speed: ${speed.toFixed(2)}km/h\r`)
  },
  error: (err) => {
    // For the moment we are awere about the end with the error emitted by timeout
    // TODO modify race.js to emit end of data
    if (err instanceof TimeoutError) {
      console.log(kuler('==============🚗Racing finished🚙===============', 'red'));
      return process.exit(1);
    }
    console.error('An error Happen reading car speed', err)
  },
  complete: () => console.log(kuler('==============🚗Race finished🚙===============', 'green'))
});

// Start the racing
console.log(kuler('Racing has started 🛣', 'cyan'))
race.start();


/**
 * Calculate real-time speed of a car
 * @param {EventEmitter} race 
 * @param {string} reqCarName 
 */
function getCarSpeed(race, reqCarName) {
  let endInfo$ = fromEvent(race, 'end');
  return fromEvent(race, 'data').pipe(
    // Keep Only requested car by name
    filter(({ carName }) => carName === reqCarName),
    // Filter bad value when time=0 preventing NaN
    filter(({ time }) => time != 0),
    // calculate speed
    map(function ({ time, xLocation }) { // time in ms, xlocation in m
      let xlocationKm = xLocation / 1000;
      let timeHour = time / (1000 * 3600);
      return (xlocationKm / timeHour)
    }),
    // When event emitter end fire we should complete subscriber
    takeUntil(endInfo$)
  )
}