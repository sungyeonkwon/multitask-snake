import {BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, Color, directionKeyMap, selectedSnakeKeyMap} from './constants';
import {Coords, Direction, INIT_SNAKE_SIZE} from './constants';
import {getNextCoords, getRandomCoords, getStartingCoords, isDirectionOpposite, requestInterval} from './helpers';

enum Progress {
  START = 1,
  PAUSE,
  RESET,
}

export class Snake {
  sequence: Coords[] = [];
  direction = Direction.RIGHT;

  constructor(start: Coords) {
    let count = INIT_SNAKE_SIZE;
    this.sequence.push(start);

    while (count > 0) {
      const next = getNextCoords(this.sequence[this.sequence.length - 1], Direction.LEFT);
      this.sequence.push(next);
      count--;
    }
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

  grow() {
    const next = getNextCoords(this.sequence[this.sequence.length - 1], this.direction);
    this.sequence.push(next);
  }

  step() {
    this.sequence.pop();
    this.sequence.unshift(this.newHead);
  }
}

export class Board {
  snakes?: Snake[];
  bounds: Coords;
  selectedSnake = 0;
  food: Coords[] = [];
  private _snakeCount?: number;

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

  setSnakeCount(count: number) {
    this._snakeCount = count;
  }

  canProceed() {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      const hasWallHit = this.bumpToWall(snake.newHead);
      if (hasWallHit) return false;
    }
    return true;
  }

  // TODO
  bumpToSnake(newHead: Coords, snake: Snake): boolean {
    return false;
    // return snake.sequence.some(
    //     segment => segment.x === newHead.x && segment.y === newHead.y);
  }

  bumpToWall(newHead: Coords): boolean {
    return newHead.x < 0 || newHead.y < 0 || newHead.x >= this.bounds.x || newHead.y >= this.bounds.y;
  }

  tick(): boolean {
    for (let i = 0; i < this.snakes.length; i++) {
      const snake = this.snakes[i];
      snake.step();

      const foodIndex = this.food.findIndex((item) => item.x === snake.newHead.x && item.y === snake.newHead.y);

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

export class Page {
  intervalId: any; // fix
  board: Board;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  speed?: number;
  eatCount = 0;
  dialog: HTMLElement = document.querySelector('.dialog');
  foodInfo: HTMLElement = document.querySelector('.food');
  gameOverContainer: HTMLElement = document.querySelector('.gameover');

  constructor(canvas: HTMLCanvasElement) {
    this.board = new Board(BOARD_WIDTH, BOARD_HEIGHT);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.drawGrid();
  }

  init(snakeCount: number) {
    this.board.setSnakeCount(snakeCount);

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

  // Add throttle
  onKeyDown = (event: KeyboardEvent) => {
    const direction = directionKeyMap.get(event.code);
    if (direction) {
      const snake = this.board.snakes.find((_, index) => index === this.board.selectedSnake);
      snake.setDirection(direction);
    }
    const index = selectedSnakeKeyMap.get(event.code);
    if (index) this.board.selectedSnake = index - 1;
  };

  stopGame() {
    cancelAnimationFrame(this.intervalId.value);
    this.dialog.classList.remove('hide');
    this.gameOverContainer.classList.add('show');
  }

  render = () => {
    this.intervalId = requestInterval(() => {
      if (!this.board.canProceed()) {
        this.stopGame();
        this.gameOverContainer.classList.add('show');
        return;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawGrid();
      this.drawFood();

      const hasEaten = this.board.tick();

      if (hasEaten) {
        this.eatCount++;
        this.foodInfo.innerText = this.eatCount.toString();
      }

      this.board.snakes.forEach((snake, snakeIndex) => {
        this.drawSnake(snake, snakeIndex);
      });
    }, 1000);
  };

  // to make it smooth, it just needs to be granular and not fixed by block.
  drawSnake(snake: Snake, snakeIndex: number) {
    const {x, y} = snake.head;
    const PADDING = 2;
    const isSnakeSelected = snakeIndex === this.board.selectedSnake;

    // Fill body
    this.ctx.fillStyle = isSnakeSelected ? Color.SNAKE_BODY_SELECTED : Color.SNAKE_BODY;
    snake.sequence.forEach((coords) => {
      this.ctx.fillRect(coords.x * (BLOCK_SIZE + 1) + 1, coords.y * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE, BLOCK_SIZE);
    });

    // Fill head
    this.ctx.fillStyle = isSnakeSelected ? Color.SNAKE_HEAD_SELECTED : Color.SNAKE_HEAD;
    this.ctx.fillRect(x * (BLOCK_SIZE + 1) + 1, y * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE, BLOCK_SIZE);

    // Fill number
    this.ctx.fillStyle = isSnakeSelected ? Color.SNAKE_HEAD_TEXT_SELECTED : Color.SNAKE_HEAD_TEXT;
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
      this.ctx.fillRect(item.x * (BLOCK_SIZE + 1) + 1, item.y * (BLOCK_SIZE + 1) + 1, BLOCK_SIZE, BLOCK_SIZE);
    });
  }

  drawGrid() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = Color.GRID;

    // Vertical lines
    for (let i = 0; i <= this.board.width; i++) {
      this.ctx.moveTo(i * (BLOCK_SIZE + 1) + 1, 0);
      this.ctx.lineTo(i * (BLOCK_SIZE + 1) + 1, (BLOCK_SIZE + 1) * this.board.height + 1);
    }

    // Horizontal lines
    for (let j = 0; j <= this.board.height; j++) {
      this.ctx.moveTo(0, j * (BLOCK_SIZE + 1) + 1);
      this.ctx.lineTo((BLOCK_SIZE + 1) * this.board.width + 1, j * (BLOCK_SIZE + 1) + 1);
    }

    this.ctx.stroke();
  }
}
