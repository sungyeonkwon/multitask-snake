import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, Color, DEFAULT_GAME_CONFIG, directionKeyMap, FRAME_RATE, GameConfig, selectedSnakeKeyMap} from '../constants';
import {Coords, Direction, INIT_SNAKE_SIZE, SNAKES, SnakeType} from '../constants';
import {getFullPattern, getNextCoords, getRandomCoords, getStartingCoords, isDirectionOpposite, requestInterval} from '../helpers';
import {Dialog, DialogState} from '../ui/dialog';
import {Board} from './board';
import {Snake} from './snake';

enum Progress {
  START = 1,
  PAUSE,
  RESET,
}

export class Page {
  intervalId: any;  // fix
  board: Board;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  speed?: number;
  eatCount = 0;
  dialog = new Dialog();
  // dialog: HTMLElement = document.querySelector('.dialog');
  foodInfo: HTMLElement = document.querySelector('.food');
  gameOverContainer: HTMLElement = document.querySelector('.gameover');
  isPaused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.drawGrid();
  }

  // Add throttle
  onKeyDown = (event: KeyboardEvent) => {
    const direction = directionKeyMap.get(event.code);
    if (direction) {
      const snake = this.board.snakes.find(
          (_, index) => index === this.board.selectedSnake);
      snake.setDirection(direction);
    }
    const index = selectedSnakeKeyMap.get(event.code);
    if (index) this.board.selectedSnake = index - 1;
  };

  startGame() {
    this.board.resetBoard();

    // populate snakes
    const snakes: Snake[] = [];
    const food: Coords[] = [];
    for (let i = 0; i < this.board.snakeCount; i++) {
      const coords = getStartingCoords(this.board.snakeCount, i);
      snakes.push(new Snake(coords));
      const newFood = getRandomCoords(this.board.bounds);
      food.push(newFood);
    }

    this.board.snakes = snakes;
    this.board.food = food;

    this.render();
  }

  stopGame() {
    console.log('stop game');
    cancelAnimationFrame(this.intervalId.value);
    this.dialog.setDialogState(DialogState.GAME_OVER);
  }

  pauseGame(isPausing = true) {
    this.isPaused = isPausing;
  }

  render = () => {
    this.intervalId = requestInterval(
        () => {
          if (this.isPaused) return;

          if (!this.board.canProceed()) {
            this.stopGame();
            return;
          }

          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          this.drawGrid();
          this.drawWall();
          this.drawFood();

          const hasEaten = this.board.tick();

          if (hasEaten) {
            this.eatCount++;
            this.foodInfo.innerText = this.eatCount.toString();
          }

          this.board.snakes.forEach((snake, snakeIndex) => {
            this.drawSnake(snake, snakeIndex);
          });
        },
        1000,
        () => {
          this.drawWall();
        });
  };

  drawWall() {
    console.log('this.board.wall', this.board.wall);
    this.ctx.beginPath();
    this.ctx.fillStyle = Color.WALL;
    this.board.wall.forEach((item) => {
      this.ctx.fillRect(
          item.x * (BLOCK_SIZE + 1) + 1, item.y * (BLOCK_SIZE + 1) + 1,
          BLOCK_SIZE, BLOCK_SIZE);
    });
  }

  // to make it smooth, it just needs to be granular and not fixed by block.
  drawSnake(snake: Snake, snakeIndex: number) {
    const {x, y} = snake.head;
    const PADDING = 2;
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
    this.ctx.font = '22px "IBM Plex Mono"';
    this.ctx.fillText(
        (snakeIndex + 1).toString(),
        x * (BLOCK_SIZE + 1) + 1 + PADDING,
        (y + 1) * (BLOCK_SIZE + 1) + 1 - PADDING,
    );
  }

  drawFood() {
    this.ctx.beginPath();
    this.ctx.fillStyle = Color.FOOD;
    this.board.food.forEach((item) => {
      this.ctx.fillRect(
          item.x * (BLOCK_SIZE + 1) + 1, item.y * (BLOCK_SIZE + 1) + 1,
          BLOCK_SIZE, BLOCK_SIZE);
    });
  }

  drawGrid() {
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
}
