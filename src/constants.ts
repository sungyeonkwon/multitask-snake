export const BOARD_WIDTH = 50;
export const BOARD_HEIGHT = 25;
export const BLOCK_SIZE = 20;
export const INIT_SNAKE_SIZE = 5;
export const INTERVAL = 400;
export const MIN_INTERVAL = 160;
export const FIXED_FOOD_SIZE = 20;

export enum Feature {
  UNSPECIFIED = 'unspecified',
  UNI_CONTROL = 'uniControl',
  MORE_FOOD = 'moreFood',
  ENEMY_SNAKE = 'enemySnake',
}

export enum GameOver {
  HIT_SELF = 1,
  HIT_WALL,
  HIT_ENEMY,
}

export enum SnakeType {
  VIPER = 'Viper',
  MAMBA = 'Mamba',
  COBRA = 'Cobra',
  RAINBOW_BOA = 'Rainbow Boa',
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
  pattern: string[][];
  description: string;
}

export const ENEMY_SNAKE_PATTERN = [
  ['red', 'red', 'red', 'red', 'red'],
  ['red', 'black', 'red', 'black', 'red'],
  ['red', 'red', 'black', 'red', 'red'],
  ['red', 'black', 'red', 'black', 'red'],
  ['red', 'red', 'red', 'red', 'red'],
];

export const SNAKES: SnakeConfig[] = [
  {
    type: SnakeType.MAMBA,
    pattern: [
      ['darkgreen', 'darkgreen', 'darkgreen', 'darkgreen', 'darkgreen'],
      ['green', 'green', 'green', 'green', 'green'],
      ['green', 'green', 'green', 'green', 'green'],
      ['green', 'green', 'green', 'green', 'green'],
      ['lightgreen', 'lightgreen', 'lightgreen', 'lightgreen', 'lightgreen'],
    ],
    description: 'Comes with the most basic environment.',
  },
  {
    type: SnakeType.VIPER,
    pattern: [
      ['lightblue', 'lightblue', 'purple', 'lightblue', 'lightblue'],
      ['lightblue', 'purple', 'red', 'purple', 'lightblue'],
      ['purple', 'red', 'red', 'red', 'purple'],
      ['lightblue', 'purple', 'red', 'purple', 'lightblue'],
      ['lightblue', 'lightblue', 'purple', 'lightblue', 'lightblue'],
    ],
    description: 'Beware: Enemy snake is present.',
  },
  {
    type: SnakeType.COBRA,
    pattern: [
      ['black', 'grey', 'darkgray', 'grey', 'black'],
      ['grey', 'grey', 'darkgray', 'grey', 'grey'],
      ['grey', 'grey', 'darkgray', 'grey', 'grey'],
      ['grey', 'grey', 'darkgray', 'grey', 'grey'],
      ['black', 'grey', 'darkgray', 'grey', 'black'],
    ],
    description: 'Eat red food, all snakes to be under one control.',
  },
  {
    type: SnakeType.RAINBOW_BOA,
    pattern: [
      ['red', 'orange', 'yellow', 'green', 'blue'],
      ['red', 'orange', 'yellow', 'green', 'blue'],
      ['red', 'orange', 'yellow', 'green', 'blue'],
      ['red', 'orange', 'yellow', 'green', 'blue'],
      ['red', 'orange', 'yellow', 'green', 'blue'],
    ],
    description: 'With abundance of food, snakes will grow faster.',
  },
  {
    type: SnakeType.PYTHON,
    pattern: [
      ['pink', 'orange', 'pink', 'pink', 'pink'],
      ['yellow', 'orange', 'orange', 'orange', 'orange'],
      ['orange', 'pink', 'pink', 'pink', 'pink'],
      ['pink', 'orange', 'pink', 'orange', 'orange'],
      ['pink', 'pink', 'orange', 'yellow', 'pink'],
    ],
    description: 'The more you eat, the faster your world runs.',
  },
  {
    type: SnakeType.ANILIUS,
    pattern: [
      ['purple', 'purple', 'purple', 'purple', 'purple'],
      ['purple', 'purple', 'purple', 'purple', 'purple'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
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

export const snakeTypeFeatureMap = new Map<SnakeType, Feature>();
snakeTypeFeatureMap.set(SnakeType.MAMBA, Feature.UNSPECIFIED);
snakeTypeFeatureMap.set(SnakeType.VIPER, Feature.ENEMY_SNAKE);
snakeTypeFeatureMap.set(SnakeType.COBRA, Feature.UNI_CONTROL);
snakeTypeFeatureMap.set(SnakeType.RAINBOW_BOA, Feature.MORE_FOOD);
snakeTypeFeatureMap.set(SnakeType.ANILIUS, Feature.UNSPECIFIED);
snakeTypeFeatureMap.set(SnakeType.PYTHON, Feature.UNSPECIFIED);