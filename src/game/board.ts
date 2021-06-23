import {ReplaySubject} from 'rxjs';
import {container, inject} from 'tsyringe';

import {Coords, DEFAULT_GAME_CONFIG, GameOver, SnakeType} from '../constants';
import {BreathFirstSearch} from '../helpers/search';
import {getRandomEatSound} from '../helpers/utils';
import {AudioService, Sound} from '../service/audio';
import {FoodService} from '../service/food';
import {Dashboard} from '../ui/dashboard';
import {Enemy} from './enemy';

import {Snake} from './snake';

export class Board {
  private _snakeCount = Number(window.sessionStorage.getItem('snake-count')) ||
      DEFAULT_GAME_CONFIG.snakeCount;
  private _snakeType =
      window.sessionStorage.getItem('snake-type') as SnakeType ||
      DEFAULT_GAME_CONFIG.snakeType;
  snakes?: Snake[];
  bounds: Coords;
  selectedSnake = 0;
  wall: Coords[] = [];
  dashboardMode: HTMLElement = document.querySelector('.mode');
  deathReason$ = new ReplaySubject<GameOver|null>(1);
  enemySnake?: Enemy|null;
  search?: BreathFirstSearch;
  boardState: Array<boolean[]> =
      [];  // Whether or not (enemy) snake can pass through

  constructor(
      width: number,
      height: number,
      @inject('audioService') readonly audioService?: AudioService,
      @inject('foodService') readonly foodService?: FoodService,
  ) {
    this.bounds = {x: width, y: height};
    this.boardState = this.getBoardState();

    container.resolve(Dashboard).isMultiSelectionTimerOn$.subscribe(isOn => {
      container.resolve(Dashboard).updateStatus(
          'Red food mode: All snakes on one control!', isOn);
    })
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
    container.resolve(Dashboard).reset();
    container.resolve(FoodService).reset();
    if (this.search) {
      this.search = null;
    }
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
    const isNotPartofEnemySnake = !this.enemySnake ?.sequence.find(segment => {
      return segment.x === x && segment.y === y;
    });
    if (isNotAlreadyWall && isNotPartofSnake && isNotPartofEnemySnake) {
      this.wall.push(block);
      this.updateBoardState(block, false);
    }
  }

  /** Call whenever there's an update from other snakes growing */
  updateBoardState(coords: Coords, isOpen: boolean) {
    this.boardState[coords.y][coords.x] = isOpen;
  }

  removeWalls(x: number, y: number) {
    const index =
        this.wall.findIndex((block) => block.x === x && block.y === y);
    if (index >= 0) {
      this.wall.splice(index, 1);
      this.updateBoardState({x, y}, true);
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
      const removedSegment = snake.step();
      this.updateBoardState(removedSegment, true);

      const foodIndex =
          this.getEatenFoodIndex(snake, container.resolve(FoodService).food);
      if (foodIndex >= 0) {
        hasEaten = true;
        this.consumeFood(foodIndex, snake, false);
        container.resolve(Dashboard).isMultiSelectionTimerOn$.next(false);
      }

      const redFoodIndex =
          this.getEatenFoodIndex(snake, container.resolve(FoodService).redFood);
      if (redFoodIndex >= 0) {
        hasEaten = true;
        this.consumeFood(redFoodIndex, snake, true);
        container.resolve(Dashboard).isMultiSelectionTimerOn$.next(true);
      }
    }

    if (this.enemySnake && this.enemySnake.isAlive) {
      this.enemySnake.setTargetFood();
      const boardState = this.getBoardState();
      this.search = new BreathFirstSearch(
          boardState, this.enemySnake.head, this.enemySnake.targetFood);
      const directionsToExhaust = this.search.solve(this.enemySnake.direction);
      this.enemySnake.setDirectionToExhaust(directionsToExhaust);
      const removedSegment = this.enemySnake.step();

      if (!this.enemySnake.isAlive) return;
      this.updateBoardState(removedSegment, true);

      const enemyEatenfoodIndex = this.getEatenFoodIndex(
          this.enemySnake, container.resolve(FoodService).food);
      if (enemyEatenfoodIndex >= 0) {
        this.consumeFood(enemyEatenfoodIndex, this.enemySnake, false, true);
      }
    }

    return hasEaten;
  }

  /**
   * Exports board state with open block as true, closed block (occupied with
   * snake bodies) as false.
   */
  private getBoardState(): Array<boolean[]> {
    for (let y = 0; y < this.bounds.y; y++) {
      this.boardState[y] = [];
      for (let x = 0; x < this.bounds.x; x++) {
        this.boardState[y].push(true);
      }
    }

    this.getSnakeAndWallCoords().forEach((coords) => {
      this.boardState[coords.y][coords.x] = false;
    });
    return this.boardState;
  }

  private consumeFood(
      foodIndex: number, snake: Snake, isRedFood: boolean, isEnemy = false) {
    const addedSegment = snake.grow();
    this.updateBoardState(addedSegment, false);
    container.resolve(AudioService)
        .play(isEnemy ? Sound.ENEMY : getRandomEatSound());
    container.resolve(FoodService)
        .replenishFood(
            foodIndex, this.snakeCount, this.getSnakeAndWallCoords(),
            isRedFood);
  }

  private getEatenFoodIndex(snake: Snake, foodArray: Coords[]) {
    // TODO: Temporary fix for the frame missing the new head position
    return foodArray.findIndex(
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
