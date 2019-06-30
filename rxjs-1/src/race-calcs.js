'use strict';

const { fromEvent, combineLatest } = require('rxjs');
const { map, filter, takeUntil, throttleTime, pairwise } = require('rxjs/operators');

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
    // get the previous value with the current in an array
    pairwise(),
    map(function ([prev, current]) { // time in ms, xlocation in m
      let { time: prevTime, xLocation: prevXLocation } = prev;
      let { time, xLocation } = current;

      // Calculate the mean between previous & current data  
      let duration = time - prevTime;
      let distance = xLocation - prevXLocation;
      let durationSec = duration / 1000;
      // We add speed to sent data to respect 'pure function' rxjs concept, not mutation
      return { ...current, speed: (distance / durationSec) }
    }),
    throttleTime(200),
    // When race emit 'end' we should complete subscriber
    takeUntil(endInfo$)
  )
}

function getLeaderBoard(race) {
  // let speedKingCar$ = getCarSpeed(race, 'The King');
  let speedQueenCar$ = new getCarSpeed(race, 'Lightning McQueen');
  let speedKingCar$ = new getCarSpeed(race, 'The King');
  return combineLatest(speedKingCar$, speedQueenCar$).pipe(
    // Rxjs does not have a sort operator 😕 need to use a map & a sort inside it
    map((carsReport) => carsReport.sort((car1, car2) => car1.xLocation - car2.xLocation < 0)),
    map(([car1, car2]) => {
      let leaderGapDistance = car1.xLocation - car2.xLocation;
      let leaderGapTime = leaderGapDistance / car2.speed; // with it's speed car2 will take leaderGapTime to catchup it's late

      return [
        { ...car1, position: 1 },
        { ...car2, leaderGapDistance, leaderGapTime, position: 2 }
      ];

    })
  )
}

module.exports = { getCarSpeed, getLeaderBoard };