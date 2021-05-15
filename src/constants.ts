export const BOARD_WIDTH = 50;
export const BOARD_HEIGHT = 30;
export const BLOCK_SIZE = 20;
export const INIT_SNAKE_SIZE = 5;

export const SNAKES = [
  {type: 'Viper', pattern: ['yellow', 'black']},
  {type: 'Green', pattern: ['green']},
  {type: 'Boa', pattern: ['red', 'blue', 'red']},
  {type: 'Viper', pattern: ['yellow', 'black']},
  {type: 'Green', pattern: ['green']},
  {type: 'Boa', pattern: ['red', 'blue', 'red']},
];

export const MAX_SNAKES_COUNT = 5;

export enum Color {
  GRID = 'lightgrey',
  SNAKE_BODY = 'pink',
  SNAKE_BODY_SELECTED = 'red',
  SNAKE_HEAD = 'white',
  SNAKE_HEAD_SELECTED = 'black',
  SNAKE_HEAD_TEXT = 'black',
  SNAKE_HEAD_TEXT_SELECTED = 'white',
  FOOD = 'blue',
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
