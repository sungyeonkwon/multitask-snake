import {Coords, DEFAULT_GAME_CONFIG, SnakeType} from '../constants';
import {getRandomCoords} from '../helpers';
import {Snake} from './snake';

export class Board {
  snakes?: Snake[];
  bounds: Coords;
  selectedSnake = 0;
  food: Coords[] = [];
  wall: Coords[] = [];
  private _snakeCount = DEFAULT_GAME_CONFIG.snakeCount;
  private _snakeType = DEFAULT_GAME_CONFIG.snakeType;

  constructor(width: number, height: number) {
    this.bounds = {x: width, y: height};
  }

  get width(): number {
    return this.bounds.x;
  }

  get height(): number {
    return this.bounds.y;
  }

  get snakeCount(): number {
    return this._snakeCount;
  }

  get snakeType(): SnakeType {
    return this._snakeType;
  }

  setSnakeType(snakeType: SnakeType) {
    this._snakeType = snakeType;
  }

  setSnakeCount(snakeCount: number) {
    this._snakeCount = snakeCount;
  }

  resetBoard() {
    this.wall = [];
  }

  canProceed() {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      const hasHitWall = this.bumpToWall(snake.newHead);
      const hasHitSelf = this.bumpToSnake(snake.newHead);
      if (hasHitWall || hasHitSelf) return false;
    }
    return true;
  }

  private bumpToSnake(newHead: Coords): boolean {
    console.log('bumpToSnake');
    return this.snakes.some(snake => {
      return snake.sequence.some(
          segment => segment.x === newHead.x && segment.y === newHead.y);
    })
  }

  private bumpToWall(newHead: Coords): boolean {
    console.log('bumpToWall');
    const bumpedToEdges = newHead.x < 0 || newHead.y < 0 ||
        newHead.x >= this.bounds.x || newHead.y >= this.bounds.y;
    const bumpedToCustomWalls =
        this.wall.find(({x, y}) => x === newHead.x && newHead.y);
    return bumpedToEdges || !!bumpedToCustomWalls;
  }

  setWalls(x: number, y: number) {
    const newWallBlock: Coords = {x, y};
    // if (!this.wall.find((block) => block.x === x && block.y)) {
    this.wall.push(newWallBlock);
    // }
  }

  tick(): boolean {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      snake.step();

      const foodIndex = this.food.findIndex(
          (item) => item.x === snake.newHead.x && item.y === snake.newHead.y);

      if (foodIndex >= 0) {
        snake.grow();
        this.food.splice(foodIndex, 1);
        this.food.push(getRandomCoords(this.bounds));
        return true;
      }
    }
    return false;
  }
}