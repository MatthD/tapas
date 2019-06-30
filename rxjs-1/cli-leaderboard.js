'use strict'

/**
 * External dependencies
 */
const Table = require('easy-table');
const kuler = require('kuler');

/**
 * Internal dependencies
 */
const { getRace } = require('./race');
const { getLeaderBoard } = require('./src/race-calcs');

const race = getRace();
const leaderBoard$ = getLeaderBoard(race);

leaderBoard$.subscribe(leaderBoard => {
  const t = new Table()
  leaderBoard.forEach(function (car) {
    // Only car @ second position will have those propoerties.
    let leaderGapDistance = car.leaderGapDistance ? kuler(`${car.leaderGapDistance.toFixed(1)}m`, 'red') : kuler('leader', 'green');
    let leaderGapTime = car.leaderGapDistance ? kuler(`${car.leaderGapTime.toFixed(1)}s`, 'red') : kuler('leader', 'green');

    let speedKmH = car.speed * 3.6;
    t.cell('#', car.position)
    t.cell('Name', car.carName)
    t.cell('Gap Distance', leaderGapDistance)
    t.cell('Gap Time', leaderGapTime)
    t.cell('Speed', kuler(`${speedKmH.toFixed()} km/h`, 'orange'))
    t.newRow()
  });
  process.stdout.write(t.toString());
  // clear current the table at next writing
  process.stdout.moveCursor(0, -4)
});

race.start();