import {take} from 'rxjs/operators';

import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, Color, directionKeyMap, GameOver, selectedSnakeKeyMap} from '../constants';
import {Coords, INTERVAL, SNAKES} from '../constants';
import {getFullPattern, getRandomCoords, getStartingCoords, requestInterval} from '../helpers';
import {Sound} from '../service/audio';
import {Dialog, DialogState} from '../ui/dialog';

import {Board} from './board';
import {Snake} from './snake';

export class Page {
  intervalId: any;  // fix
  board: Board;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  speed?: number;
  eatCount = 0;
  dialog = new Dialog();
  foodInfo: HTMLElement = document.querySelector('.food');
  wallInfo: HTMLElement = document.querySelector('.wall');
  gameOverContainer: HTMLElement = document.querySelector('.gameover');
  isGamePlaying = false;

  constructor(canvas: HTMLCanvasElement) {
    this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.drawGrid();
  }

  handleDirection(keycode: string) {
    const direction = directionKeyMap.get(keycode);
    const snake = this.board.snakes.find(
        (_, index) => index === this.board.selectedSnake);
    snake.setDirection(direction);
  }

  handleSnakeSelection(keycode: string) {
    const index = selectedSnakeKeyMap.get(keycode);
    if (index && index <= this.board.snakes.length) {
      this.board.selectedSnake = index - 1;
    };
  };

  startGame() {
    this.board.resetBoard();

    // populate snakes
    const snakes: Snake[] = [];
    const food: Coords[] = [];
    for (let i = 0; i < this.board.snakeCount; i++) {
      const coords = getStartingCoords(this.board.snakeCount, i);
      snakes.push(new Snake(coords));

      const newFood = getRandomCoords(
          this.board.bounds, this.board.getSnakeAndWallCoords());
      food.push(newFood);
    }

    this.board.snakes = snakes;
    this.board.food = food;

    this.render();
    this.isGamePlaying = true;
  }

  stopGame() {
    cancelAnimationFrame(this.intervalId.value);
    // TODO: take(1)
    this.board.deathReason$.pipe().subscribe((reason: GameOver) => {
      if (!reason) return;
      this.dialog.setDialogState(
          DialogState.GAME_OVER, this.getGameOverMessage(reason));
    });

    setTimeout(() => this.board.audioService.play(Sound.GAME_OVER), 700);
    // TODO: disable wall / pause
  }

  pauseGame(isPausing = true) {
    if (isPausing) {
      cancelAnimationFrame(this.intervalId.value);
    } else {
      this.render();
    }
    this.isGamePlaying = !this.isGamePlaying;
  }

  render(renderWallOnly = false) {
    // called interval-ly
    this.intervalId = requestInterval(() => {
      if (!this.board.canProceed()) {
        this.stopGame();
        return;
      }

      this.drawAll();

      if (renderWallOnly) return;

      const hasEaten = this.board.tick();
      if (hasEaten) {
        this.eatCount++;
        this.foodInfo.innerText = this.eatCount.toString();
      }
    }, INTERVAL, () => this.drawAll());
  };

  private drawAll() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawWall();
    this.drawFood();
    this.board.snakes.forEach((snake, snakeIndex) => {
      this.drawSnake(snake, snakeIndex);
    });
    this.wallInfo.innerText = this.board.wall.length.toString();
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
  private drawSnake(snake: Snake, snakeIndex: number) {
    const {x, y} = snake.head;
    const PADDING = 4;
    const isSnakeSelected = snakeIndex === this.board.selectedSnake;

    // Fill body
    const pattern = SNAKES.find(s => s.type === this.board.snakeType).pattern;
    const fullPattern = getFullPattern(pattern, snake.sequence.length)
    snake.sequence.forEach((coords, index) => {
      this.ctx.fillStyle = fullPattern[index];
      this.ctx.fillRect(
          coords.x * (BLOCK_SIZE + 1) + 1, coords.y * (BLOCK_SIZE + 1) + 1,
          BLOCK_SIZE, BLOCK_SIZE);
    });

    // Fill head
    this.ctx.fillStyle =
        isSnakeSelected ? Color.SNAKE_HEAD_SELECTED : Color.SNAKE_HEAD;
    this.ctx.fillRect(
        x * (BLOCK_SIZE + 1) + 1, y * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE,
        BLOCK_SIZE);

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

  private drawFood() {
    this.ctx.beginPath();
    this.ctx.fillStyle = Color.FOOD;
    this.board.food.forEach((item) => {
      const centerX = item.x * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2;
      const centerY = item.y * (BLOCK_SIZE + 1) + 1 + BLOCK_SIZE / 2;
      this.ctx.arc(centerX, centerY, BLOCK_SIZE / 2, 0, 2 * Math.PI, false);
      this.ctx.fill();
      this.ctx.closePath();
    });
  }

  private getGameOverMessage(gameOver: GameOver): string {
    switch (gameOver) {
      case GameOver.HIT_SELF:
        return 'You have hit yourself.';
      case GameOver.HIT_WALL:
        return 'You have hit a wall.';
      default:
        return 'Maybe you cannot handle this.';
    }
  }
}
