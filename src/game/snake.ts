import {Coords, Direction, INIT_SNAKE_SIZE} from '../constants';
import {getNextCoords, isDirectionOpposite} from '../helpers/utils';

export class Snake {
  sequence: Coords[] = [];
  direction: Direction;

  constructor(start: Coords, direction: Direction) {
    this.direction = direction;
    this.makeBody(start);
  }

  get head(): Coords {
    return this.sequence[0];
  }

  get newHead(): Coords {
    return getNextCoords(this.sequence[0], this.direction);
  }

  setDirection(direction: Direction) {
    if (isDirectionOpposite(direction, this.direction)) return;
    this.direction = direction;
  }

  grow(): Coords {
    const next =
        getNextCoords(this.sequence[this.sequence.length - 1], this.direction);
    this.sequence.push(next);
    return next;
  }

  step(): Coords {
    this.sequence.unshift(this.newHead);
    return this.sequence.pop();
  }

  makeBody(start: Coords) {
    let count = INIT_SNAKE_SIZE;
    this.sequence.push(start);

    const buildingDirection =
        this.direction === Direction.RIGHT ? Direction.LEFT : Direction.RIGHT;
    while (count > 0) {
      const next = getNextCoords(
          this.sequence[this.sequence.length - 1], buildingDirection);
      this.sequence.push(next);
      count--;
    }
  }
}