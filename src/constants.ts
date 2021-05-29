export const BOARD_WIDTH = 50;
export const BOARD_HEIGHT = 30;
export const BLOCK_SIZE = 20;
export const FRAME_RATE = 10;
export const INIT_SNAKE_SIZE = 5;

export enum SnakeType {
  VIPER = 'Viper',
  MAMBA = 'Mamba',
  DISPHOLIDUS = 'Dispholidus',
  ANACONDA = 'Anaconda',
  PYTHON = 'Python',
  ANILIUS = 'Anilius',
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  snakeType: SnakeType.VIPER,
  snakeCount: 3,
}

export interface GameConfig {
  snakeType: SnakeType;
  snakeCount: number;
}

export const SNAKES = [
  {
    type: SnakeType.VIPER,
    pattern: [
      'blue',
      'grey',
    ]
  },
  {
    type: SnakeType.MAMBA,
    pattern: [
      'green',
    ]
  },
  {
    type: SnakeType.DISPHOLIDUS,
    pattern: [
      'red',
      'blue',
      'red',
    ]
  },
  {
    type: SnakeType.ANACONDA,
    pattern: [
      'yellow',
      'black',
    ]
  },
  {
    type: SnakeType.PYTHON,
    pattern: [
      'grey',
      'darkgrey',
    ]
  },
  {
    type: SnakeType.ANILIUS,
    pattern: [
      'pink',
      'blue',
      'orange',
      'pink',
    ]
  },
];

export const MAX_SNAKES_COUNT = 5;

export enum Color {
  GRID = 'lightgrey',
  SNAKE_HEAD = 'white',
  SNAKE_HEAD_SELECTED = 'black',
  SNAKE_HEAD_TEXT = 'black',
  SNAKE_HEAD_TEXT_SELECTED = 'white',
  FOOD = 'blue',
  WALL = 'black',
}

export enum Direction {
  UP = 1,
  DOWN,
  LEFT,
  RIGHT,
}

export interface Coords {
  x: number;
  y: number;
}

export const directionKeyMap = new Map<string, Direction>();
directionKeyMap.set('ArrowLeft', Direction.LEFT);
directionKeyMap.set('ArrowUp', Direction.UP);
directionKeyMap.set('ArrowRight', Direction.RIGHT);
directionKeyMap.set('ArrowDown', Direction.DOWN);

export const selectedSnakeKeyMap = new Map<string, number>();
selectedSnakeKeyMap.set('Digit1', 1);
selectedSnakeKeyMap.set('Digit2', 2);
selectedSnakeKeyMap.set('Digit3', 3);
selectedSnakeKeyMap.set('Digit4', 4);
selectedSnakeKeyMap.set('Digit5', 5);
