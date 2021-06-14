import {ReplaySubject} from 'rxjs';
import {container, inject} from 'tsyringe';

import {Coords, DEFAULT_GAME_CONFIG, GameOver, SnakeType} from '../constants';
import {getRandomCoords, getRandomEatSound} from '../helpers';
import {AudioService, Sound} from '../service/audio';

import {Snake} from './snake';

export class Board {
  snakes?: Snake[];
  bounds: Coords;
  selectedSnake = 0;
  food: Coords[] = [];
  wall: Coords[] = [];
  foodInfo: HTMLElement = document.querySelector('.food');
  wallInfo: HTMLElement = document.querySelector('.wall');
  private _snakeCount = DEFAULT_GAME_CONFIG.snakeCount;
  private _snakeType = DEFAULT_GAME_CONFIG.snakeType;
  deathReason$ = new ReplaySubject<GameOver|null>(1);

  constructor(
      width: number,
      height: number,
      @inject('audioService') readonly audioService?: AudioService,
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
    this.foodInfo.innerText = '0';
    this.wallInfo.innerText = '0';
  }

  canProceed(): boolean {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      const hitWall = this.bumpToWall(snake.newHead);
      const hitSelf = this.bumpToSnake(snake.newHead);
      if (hitWall) {
        container.resolve(AudioService).play(Sound.HIT);
        this.deathReason$.next(GameOver.HIT_WALL);
        return false;
      } else if (hitSelf) {
        container.resolve(AudioService).play(Sound.HIT);
        this.deathReason$.next(GameOver.HIT_SELF);
        return false;
      }
    }
    return true;
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

  getSnakeAndWallCoords(): Coords[] {
    return [
      ...this.wall,
      ...(this.snakes ? this.snakes.flatMap(snake => snake.sequence) : []),
    ];
  }

  tick(): boolean {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      snake.step();

      // TODO: Temporary fix for the frame missing the new head position
      const foodIndex = this.food.findIndex(
          (item) => {return (item.x === snake.sequence[0].x &&
                             item.y === snake.sequence[0].y) ||
                     (item.x === snake.sequence[1].x &&
                      item.y === snake.sequence[1].y)});
      if (foodIndex >= 0) {
        snake.grow();
        container.resolve(AudioService).play(getRandomEatSound());
        this.food.splice(foodIndex, 1);
        this.food.push(
            getRandomCoords(this.bounds, this.getSnakeAndWallCoords()));
        return true;
      }
    }
    return false;
  }
}
