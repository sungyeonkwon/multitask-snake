import {take} from 'rxjs/operators';
import {container, inject} from 'tsyringe';

import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, Color, Coords, Direction, directionKeyMap, ENEMY_SNAKE_PATTERN, Feature, FOOD_MULTIPLY_FACTOR, GameOver, selectedSnakeKeyMap, SnakeType, snakeTypeFeatureMap} from '../constants';
import {INTERVAL, SNAKES} from '../constants';
import {getFullPattern, getStartingCoords, requestInterval} from '../helpers';
import {AudioService, Sound} from '../service/audio';
import {FoodService} from '../service/food';
import {Dashboard} from '../ui/dashboard';
import {Dialog, DialogState} from '../ui/dialog';

import {Board} from './board';
import {Enemy} from './enemy';
import {Snake} from './snake';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  intervalId: {value: number, delta: number};
  board: Board;
  dialog = new Dialog();
  isGamePlaying = false;
  feature: Feature|null;

  constructor(
      canvas: HTMLCanvasElement,
      @inject('foodService') readonly foodService?: FoodService,
      @inject('dashboard') readonly dashboard?: Dashboard,
  ) {
    this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.drawGrid();
  }

  handleDirection(keycode: string) {
    const direction = directionKeyMap.get(keycode);

    container.resolve(Dashboard)
        .isMultiSelectionTimerOn$.pipe(take(1))
        .subscribe((isOn) => {
          if (isOn) {
            this.board.snakes.forEach(snake => {
              snake.setDirection(direction);
            })
          } else {
            const snake = this.board.snakes.find(
                (_, index) => index === this.board.selectedSnake);
            snake.setDirection(direction);
          }
        })
  }

  handleSnakeSelection(keycode: string) {
    const index = selectedSnakeKeyMap.get(keycode);
    if (index && index <= this.board.snakes.length) {
      this.board.selectedSnake = index - 1;
    };
  };

  private activateFeature() {
    switch (this.board.snakeType) {
      case SnakeType.VIPER:
        this.activateEnemySnake();
        break;
      case SnakeType.ANACONDA:
        container.resolve(FoodService).multiplyBy = FOOD_MULTIPLY_FACTOR;
      case SnakeType.COBRA:
        container.resolve(FoodService).isRedFoodEnabled = true;
        break;
      default:
        break;
    }
    this.feature = snakeTypeFeatureMap.get(this.board.snakeType);
  }

  startGame() {
    this.board.resetBoard();
    this.activateFeature();

    // Populate snakes
    const snakes: Snake[] = [];
    for (let i = 0; i < this.board.snakeCount; i++) {
      const coords = getStartingCoords(this.board.snakeCount, i);
      snakes.push(new Snake(coords, Direction.RIGHT));
      container.resolve(FoodService)
          .addFood(this.board.getSnakeAndWallCoords(), false);
    }

    this.board.snakes = snakes;
    this.render();
    this.isGamePlaying = true;
  }

  stopGame() {
    cancelAnimationFrame(this.intervalId.value);
    this.board.deathReason$.pipe(take(1)).subscribe((reason: GameOver) => {
      if (!reason) return;
      this.dialog.setDialogState(
          DialogState.GAME_OVER, this.getGameOverMessage(reason));
    });

    setTimeout(
        () => container.resolve(AudioService).play(Sound.GAME_OVER), 700);
    // TODO: disable wall / pause
  }

  pauseGame(isPausing = true) {
    if (isPausing) {
      cancelAnimationFrame(this.intervalId.value);
    } else {
      this.render();
    }
    container.resolve(Dashboard).pauseTimer$.next(isPausing);
    this.isGamePlaying = !this.isGamePlaying;
  }

  render(renderWallOnly = false) {
    // called interval-ly
    this.intervalId = requestInterval(
        () => {
          if (!this.board.canProceed()) {
            this.stopGame();
            return;
          }

          this.drawAll(this.intervalId.delta);

          if (renderWallOnly) return;

          const hasEaten = this.board.tick();
          if (hasEaten) {
            container.resolve(FoodService).increaseFoodCount();
          }
        },
        INTERVAL,
        () => {
          this.drawAll(this.intervalId.delta);
        });
  };

  private activateEnemySnake() {
    const enemyStartingCoords = {x: BOARD_WIDTH / 2, y: 0};
    this.board.enemySnake =
        new Enemy(enemyStartingCoords, Direction.LEFT, this.board.bounds);
  }

  private drawAll(frame: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawWall();
    this.drawFood(frame);
    this.board.snakes.forEach((snake, snakeIndex) => {
      this.drawSnake(snake, snakeIndex);
    });
    if (this.board.enemySnake) {
      this.drawSnake(this.board.enemySnake, null, true);
    }
    container.resolve(Dashboard).updateWallCount(this.board.wall.length);
  }

  private drawGrid() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = Color.GRID;

    // Vertical lines
    for (let i = 0; i <= this.board.width; i++) {
      this.ctx.moveTo(i * (BLOCK_SIZE + 1) + 1, 0);
      this.ctx.lineTo(
          i * (BLOCK_SIZE + 1) + 1, (BLOCK_SIZE + 1) * this.board.height + 1);
    }

    // Horizontal lines
    for (let j = 0; j <= this.board.height; j++) {
      this.ctx.moveTo(0, j * (BLOCK_SIZE + 1) + 1);
      this.ctx.lineTo(
          (BLOCK_SIZE + 1) * this.board.width + 1, j * (BLOCK_SIZE + 1) + 1);
    }

    this.ctx.stroke();
  }

  private drawWall() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = Color.WALL;
    this.board.wall.forEach((item) => {
      this.ctx.lineWidth = 7;
      // '+' shape
      // this.ctx.moveTo(
      //     item.x * (BLOCK_SIZE + 1) + 1,
      //     item.y * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2);
      // this.ctx.lineTo(
      //     item.x * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE,
      //     item.y * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2);
      // this.ctx.moveTo(
      //     item.x * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2,
      //     item.y * (BLOCK_SIZE + 1) + 1);
      // this.ctx.lineTo(
      //     item.x * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2,
      //     item.y * (BLOCK_SIZE + 1) + BLOCK_SIZE + 1);


      // 'x' shape
      this.ctx.moveTo(
          item.x * (BLOCK_SIZE + 1) + 1, item.y * (BLOCK_SIZE + 1) + 1);
      this.ctx.lineTo(
          item.x * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE,
          item.y * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE);
      this.ctx.moveTo(
          item.x * (BLOCK_SIZE + 1) + 1,
          item.y * (BLOCK_SIZE + 1) + BLOCK_SIZE + 1);
      this.ctx.lineTo(
          item.x * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE,
          item.y * (BLOCK_SIZE + 1) + 1);
    });
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }

  // to make it smooth, it just needs to be granular and not fixed by block.
  private drawSnake(
      snake: Snake, snakeIndex: number|null, isEnemySnake = false) {
    const {x, y} = snake.head;
    const PADDING = 4;
    const isSnakeSelected = snakeIndex === this.board.selectedSnake;

    // Fill body
    const pattern = SNAKES.find(s => s.type === this.board.snakeType).pattern;
    const fullPattern = isEnemySnake ?
        ENEMY_SNAKE_PATTERN :
        getFullPattern(pattern, snake.sequence.length);  // Enemy snake pattern
    snake.sequence.forEach((coords, index) => {
      this.ctx.fillStyle = fullPattern[index];
      this.ctx.fillRect(
          coords.x * (BLOCK_SIZE + 1) + 1, coords.y * (BLOCK_SIZE + 1) + 1,
          BLOCK_SIZE, BLOCK_SIZE);
    });

    // Fill head
    container.resolve(Dashboard)
        .isMultiSelectionTimerOn$.pipe(take(1))
        .subscribe(isOn => {
          this.ctx.fillStyle = isOn || isSnakeSelected ?
              Color.SNAKE_HEAD_SELECTED :
              Color.SNAKE_HEAD;
          this.ctx.fillRect(
              x * (BLOCK_SIZE + 1) + 1, y * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE,
              BLOCK_SIZE);
        })

    if (isEnemySnake) return;
    // Fill number
    this.ctx.fillStyle = isSnakeSelected ? Color.SNAKE_HEAD_TEXT_SELECTED :
                                           Color.SNAKE_HEAD_TEXT;
    this.ctx.font = '23px "VT323"';
    this.ctx.fillText(
        (snakeIndex + 1).toString(),
        x * (BLOCK_SIZE + 1) + 2 + PADDING,
        (y + 1) * (BLOCK_SIZE + 1) + 1 - PADDING,
    );
  }

  private drawFoodPiece(
      centerX: number, centerY: number, r: number, opacity: number,
      rgb: number[]) {
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, r, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
    this.ctx.fill();
    this.ctx.closePath();
  }

  private drawFood(frame: number) {
    container.resolve(FoodService).food.forEach((item) => {
      const greenRgb = [0, 255, 0];
      this.drawFoodGroup(item, frame, greenRgb);
    });

    container.resolve(FoodService).redFood.forEach((item) => {
      const redRgb = [255, 0, 0];
      this.drawFoodGroup(item, frame, redRgb);
    });
  }

  private drawFoodGroup(foodItem: Coords, frame: number, rgb: number[]) {
    const centerX = foodItem.x * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2;
    const centerY = foodItem.y * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2;

    const r = BLOCK_SIZE / 2;
    const MIN_R = 3;
    const posSlope = (r - MIN_R) * 2 / INTERVAL;
    const yIntercept = posSlope * INTERVAL / 2 + r;

    const firstHalf = frame <= INTERVAL / 2;
    const r1 =
        firstHalf ? posSlope * frame + MIN_R : -posSlope * frame + yIntercept;
    this.drawFoodPiece(centerX, centerY, r1, 0.3, rgb);

    const r2 =
        firstHalf ? -posSlope * frame + yIntercept : posSlope * frame + MIN_R;
    this.drawFoodPiece(centerX, centerY, r2, 0.1, rgb);

    // Static food layer
    this.drawFoodPiece(centerX, centerY, r * 2 / 3, 0.1, rgb);
  }

  private getGameOverMessage(gameOver: GameOver): string {
    switch (gameOver) {
      case GameOver.HIT_SELF:
        return 'You have hit yourself.';
      case GameOver.HIT_WALL:
        return 'You have hit a wall.';
      case GameOver.HIT_ENEMY:
        return 'Enemy snake killed you.';
      default:
        return 'Maybe you cannot handle this.';
    }
  }
}
