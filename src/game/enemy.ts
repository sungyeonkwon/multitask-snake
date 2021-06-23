import {container, inject} from 'tsyringe';
import {Coords, Direction} from '../constants';
import {FoodService} from '../service/food';
import {Snake} from './snake';

export class Enemy extends Snake {
  targetFood: Coords|null;
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

  setTargetFood() {
    // Enemy is smart, she targets the closest food.
    // TODO: This doesn't take into account the blockers.
    this.targetFood = container.resolve(FoodService)
                          .food
                          .map(food => {
                            return {
                              value: food,
                              distance: Math.abs(food.x - this.head.x) +
                                  Math.abs(food.y - this.head.y)
                            };
                          })
                          .sort((a, b) => a.distance - b.distance)
                          .map(item => item.value)[0];
  }
}
