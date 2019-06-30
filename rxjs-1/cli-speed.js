'use strict'

/**
 * External dependencies
 */
const kuler = require('kuler');

/**
 * Internal dependencies
 */
const { Race, getRace } = require('./race');
const { getCarSpeed } = require('./src/speed');


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
  complete: () => console.log(kuler('\n🚗Race finished🚙', 'green'))
});

// Start the racing
console.log(kuler('Racing has started 🛣', 'cyan'))
race.start();