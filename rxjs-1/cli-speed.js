'use strict'

/**
 * External dependencies
 */
const kuler = require('kuler');
const { fromEvent, merge } = require('rxjs');
const { map, filter, takeUntil, throttleTime } = require('rxjs/operators');

/**
 * Internal dependencies
 */
const { Race, getRace } = require('./race');


const race = getRace();
const carName = 'Lightning McQueen';
const speed$ = getCarSpeed(race, carName);

let subs = speed$.subscribe({
  next: (speed) => {
    if (isNaN(speed)) return; // speed is not a number, stop here
    process.stdout.write(`\rSpeed: ${speed.toFixed(1)} km/h`)
  },
  error: (err) => {
    console.error(kuler(`An error Happen reading car speed: ${err}`, 'red'))
  },
  complete: () => console.log(kuler('\n==============🚗Race finished🚙===============', 'green'))
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
    throttleTime(300),
    // calculate speed
    map(function ({ time, xLocation }) { // time in ms, xlocation in m
      let xlocationKm = xLocation / 1000;
      let timeHour = time / (1000 * 3600);
      return (xlocationKm / timeHour)
    }),
    // When race emit 'end' we should complete subscriber
    takeUntil(endInfo$)
  )
}