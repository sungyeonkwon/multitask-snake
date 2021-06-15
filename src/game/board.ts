import {ReplaySubject} from 'rxjs';
import {container, inject} from 'tsyringe';

import {BOARD_WIDTH, Coords, DEFAULT_GAME_CONFIG, Direction, GameOver, SnakeType} from '../constants';
import {getRandomCoords, getRandomEatSound} from '../helpers';
import {AudioService, Sound} from '../service/audio';
import {FoodService} from '../service/food';
import {Enemy} from './enemy';

import {Snake} from './snake';

export class Board {
  private _snakeCount = DEFAULT_GAME_CONFIG.snakeCount;
  private _snakeType = DEFAULT_GAME_CONFIG.snakeType;
  snakes?: Snake[];
  bounds: Coords;
  selectedSnake = 0;
  wall: Coords[] = [];
  wallInfo: HTMLElement = document.querySelector('.wall');
  deathReason$ = new ReplaySubject<GameOver|null>(1);
  enemySnake?: Enemy|null;

  constructor(
      width: number,
      height: number,
      @inject('audioService') readonly audioService?: AudioService,
      @inject('foodService') readonly foodService?: FoodService,
  ) {
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
    this.selectedSnake = 0;
    this.deathReason$.next(null);
    this.enemySnake = null;
    this.wallInfo.innerText = '0';
    container.resolve(FoodService).reset();
  }

  canProceed(): boolean {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      const hitWall = this.bumpToWall(snake.newHead);
      const hitSelf = this.bumpToSnake(snake.newHead);
      const hitEnemy = this.bumpToEnemy(snake);
      if (hitWall) {
        container.resolve(AudioService).play(Sound.HIT);
        this.deathReason$.next(GameOver.HIT_WALL);
        return false;
      } else if (hitSelf) {
        container.resolve(AudioService).play(Sound.HIT);
        this.deathReason$.next(GameOver.HIT_SELF);
        return false;
      } else if (hitEnemy) {
        container.resolve(AudioService).play(Sound.HIT);
        this.deathReason$.next(GameOver.HIT_ENEMY);
        return false;
      }
    }
    return true;
  }

  setWalls(x: number, y: number) {
    const block: Coords = {x, y};

    const isNotAlreadyWall =
        !this.wall.find((block) => block.x === x && block.y === y);
    const isNotPartofSnake = !this.snakes.find(snake => {
      return snake.sequence.find(segment => segment.x === x && segment.y === y);
    });
    if (isNotAlreadyWall && isNotPartofSnake) {
      this.wall.push(block);
    }
  }

  removeWalls(x: number, y: number) {
    const index =
        this.wall.findIndex((block) => block.x === x && block.y === y);
    if (index >= 0) {
      this.wall.splice(index, 1);
    }
  }

  /** Gets all coords that one snake should not collide into. */
  getSnakeAndWallCoords(): Coords[] {
    return [
      ...this.wall,
      ...(this.snakes ? this.snakes.flatMap(snake => snake.sequence) : []),
      ...(this.enemySnake ? this.enemySnake.sequence : []),
    ];
  }

  tick(): boolean {
    let hasEaten = false;
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      snake.step();
      const foodIndex = this.getEatenFoodIndex(snake);
      if (foodIndex >= 0) {
        hasEaten = true;
        this.consumeFood(foodIndex, snake);
      }
    }

    if (this.enemySnake) {
      this.enemySnake.step();
      const enemyEatenfoodIndex = this.getEatenFoodIndex(this.enemySnake);
      if (enemyEatenfoodIndex >= 0) {
        this.consumeFood(enemyEatenfoodIndex, this.enemySnake);
      }
    }

    return hasEaten;
  }

  private consumeFood(foodIndex: number, snake: Snake) {
    snake.grow();
    container.resolve(AudioService).play(getRandomEatSound());
    container.resolve(FoodService).food.splice(foodIndex, 1);
    container.resolve(FoodService)
        .food.push(getRandomCoords(this.bounds, this.getSnakeAndWallCoords()));
  }

  private getEatenFoodIndex(snake: Snake) {
    // TODO: Temporary fix for the frame missing the new head position
    return container.resolve(FoodService)
        .food.findIndex(
            (item) => {return (item.x === snake.sequence[0].x &&
                               item.y === snake.sequence[0].y) ||
                       (item.x === snake.sequence[1].x &&
                        item.y === snake.sequence[1].y)});
  }

  private bumpToEnemy(snake: Snake): boolean {
    if (!this.enemySnake) return false;
    return snake.sequence.some(segment => {
      return this.enemySnake.sequence.some(
          enemySegment =>
              enemySegment.x === segment.x && enemySegment.y === segment.y);
    });
  }

  private bumpToSnake(newHead: Coords): boolean {
    return this.snakes.some(snake => {
      return snake.sequence.some(
          segment => segment.x === newHead.x && segment.y === newHead.y);
    })
  }

  private bumpToWall(newHead: Coords): boolean {
    const bumpedToEdges = newHead.x < 0 || newHead.y < 0 ||
        newHead.x >= this.bounds.x || newHead.y >= this.bounds.y;
    const bumpedToCustomWalls =
        this.wall.find(({x, y}) => x === newHead.x && y === newHead.y);
    return bumpedToEdges || !!bumpedToCustomWalls;
  }
}
