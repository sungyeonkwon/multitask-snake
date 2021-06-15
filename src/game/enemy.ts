import {container, inject} from 'tsyringe';
import {Coords, Direction} from '../constants';
import {FoodService} from '../service/food';
import {Snake} from './snake';

export class Enemy extends Snake {
  bounds: Coords;
  targetFood: Coords;
  directionsToExhaust: Direction[] = [];

  constructor(
      start: Coords,
      direction: Direction,
      bounds: Coords,
      @inject('foodService') readonly foodService?: FoodService,
  ) {
    super(start, direction);
    this.bounds = bounds;
  }

  setDirectionsToExhaust() {
    const xToMove = this.targetFood.x - this.head.x;
    const yToMove = this.targetFood.y - this.head.y;

    if (xToMove > 0) {
      this.directionsToExhaust.push(...Array(xToMove).fill(Direction.RIGHT));
    }
    if (yToMove > 0) {
      this.directionsToExhaust.push(...Array(yToMove).fill(Direction.DOWN));
    }
    if (xToMove < 0) {
      this.directionsToExhaust.push(
          ...Array(Math.abs(xToMove)).fill(Direction.LEFT));
    }
    if (yToMove < 0) {
      this.directionsToExhaust.push(
          ...Array(Math.abs(yToMove)).fill(Direction.UP));
    }

    // Shuffle sequence
    this.directionsToExhaust =
        this.directionsToExhaust.map((a) => ({sort: Math.random(), value: a}))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => a.value);
  }

  step() {
    this.confirmTargetFood();
    this.confirmDirections();

    // TODO: Don't enalbe the enemy snake to do yoga
    this.direction = this.directionsToExhaust.pop();
    this.sequence.pop();
    this.sequence.unshift(this.newHead);
  }

  private confirmTargetFood() {
    this.directionsToExhaust = [];

    // Enemy is smart, she targets the closest food
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

  private confirmDirections() {
    if (this.directionsToExhaust.length !== 0) return;
    this.setDirectionsToExhaust();
  }
}
