import {inject} from 'tsyringe';
import {Coords, Direction} from '../constants';
import {FoodService} from '../service/food';
import {Snake} from './snake';

export class Enemy extends Snake {
  directionsToExhaust: Direction[] = [];
  isAlive = true;

  constructor(
      start: Coords,
      direction: Direction,
      @inject('foodService') readonly foodService?: FoodService,
  ) {
    super(start, direction);
  }

  step(): Coords|null {
    if (this.directionsToExhaust.length > 0) {
      this.direction = this.directionsToExhaust.shift();
      this.sequence.unshift(this.newHead);
      return this.sequence.pop();
    } else {
      this.isAlive = false;
      return null;
    }
  }

  setDirectionToExhaust(directionsToExhaust: Direction[]) {
    this.directionsToExhaust = directionsToExhaust;
  }
}
