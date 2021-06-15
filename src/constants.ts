export const BOARD_WIDTH = 50;
export const BOARD_HEIGHT = 25;
export const BLOCK_SIZE = 20;
export const INIT_SNAKE_SIZE = 5;
export const INTERVAL = 400;
export const ANACONDA_FOOD_MULTIPLY_FACTOR = 4;
export enum GameOver {
  HIT_SELF = 1,
  HIT_WALL,
  HIT_ENEMY,
}

export enum SnakeType {
  VIPER = 'Viper',
  MAMBA = 'Mamba',
  DISPHOLIDUS = 'Dispholidus',
  ANACONDA = 'Anaconda',
  PYTHON = 'Python',
  ANILIUS = 'Anilius',
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  snakeType: SnakeType.MAMBA,
  snakeCount: 2,
}

export interface GameConfig {
  snakeType: SnakeType;
  snakeCount: number;
}

interface SnakeConfig {
  type: SnakeType;
  pattern: string[];
  description: string;
}

export const ENEMY_SNAKE_PATTERN = ['red'];

export const SNAKES: SnakeConfig[] = [
  {
    type: SnakeType.MAMBA,
    pattern: [
      'green',
    ],
    description: 'Comes with the most basic environment.',
  },
  {
    type: SnakeType.VIPER,
    pattern: [
      'blue',
      'grey',
    ],
    description: 'Beware: Enemy snake is present.',
  },
  {
    type: SnakeType.DISPHOLIDUS,
    pattern: [
      'red',
      'blue',
      'red',
    ],
    description: '(Coming) Eat red food, all snakes to be under one control.',
  },
  {
    type: SnakeType.ANACONDA,
    pattern: [
      'yellow',
      'grey',
    ],
    description: 'With abundance of food, snakes will grow faster.',
  },
  {
    type: SnakeType.PYTHON,
    pattern: [
      'grey',
      'darkgrey',
    ],
    description: '(Environment TBC)',
  },
  {
    type: SnakeType.ANILIUS,
    pattern: [
      'pink',
      'blue',
      'orange',
      'pink',
    ],
    description: '(Environment TBC)',
  },
];

export const MAX_SNAKES_COUNT = 5;

export enum Color {
  GRID = 'rgb(38, 38, 38)',
  SNAKE_HEAD = 'white',
  SNAKE_HEAD_SELECTED = 'red',
  SNAKE_HEAD_TEXT = 'black',
  SNAKE_HEAD_TEXT_SELECTED = 'white',
  WALL = 'red',
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
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
