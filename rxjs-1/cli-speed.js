'use strict'

/**
 * External dependencies
 */
const kuler = require('kuler');
const { fromEvent, merge } = require('rxjs');
const { map, filter, takeUntil, throttleTime, pairwise } = require('rxjs/operators');

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
    process.stdout.write(`Speed: ${speed.toFixed(1)} km/h\r`)
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
    throttleTime(200),
    // Keep Only requested car by name
    filter(({ carName }) => carName === reqCarName),
    // Filter bad value when time=0 preventing NaN
    filter(({ time }) => time != 0),
    // get the previous value with the current in an array
    pairwise(),
    // calculate mean speed
    map(function ([prev, current]) { // time in ms, xlocation in m
      let { time: prevTime, xLocation: prevXLocation } = prev;
      let { time, xLocation } = current;

      // Calculate the mean between previous & current data  
      let duration = time - prevTime;
      let distance = xLocation - prevXLocation;
      let distanceKm = distance / 1000;
      let durationHour = duration / (1000 * 3600);
      return (distanceKm / durationHour)
    }),
    // When race emit 'end' we should complete subscriber
    takeUntil(endInfo$)
  )
}