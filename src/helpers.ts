import {BOARD_HEIGHT, BOARD_WIDTH, Coords, Direction} from './constants';

export function getStartingCoords(snakeCount: number, index: number) {
  return {
    x: Math.floor((BOARD_WIDTH / (snakeCount + 1)) * (index + 1)),
    y: Math.floor((BOARD_HEIGHT / (snakeCount + 1)) * (index + 1)),
  };
}

// TODO: exclude array of coords
export function getRandomCoords(
    bounds: Coords, excludeArray: Coords[]): Coords {
  let randomCoords = {
    x: Math.floor(Math.random() * bounds.x),
    y: Math.floor(Math.random() * bounds.y),
  };
  while (excludeArray.find(
      coords => coords.x === randomCoords.x && coords.y === randomCoords.y)) {
    randomCoords = {
      x: Math.floor(Math.random() * bounds.x),
      y: Math.floor(Math.random() * bounds.y),
    };
  }
  return randomCoords;
}

export function getNextCoords(coords: Coords, direction: Direction): Coords {
  switch (direction) {
    case Direction.UP:
      return {...coords, y: coords.y - 1};
    case Direction.DOWN:
      return {...coords, y: coords.y + 1};
    case Direction.LEFT:
      return {...coords, x: coords.x - 1};
    case Direction.RIGHT:
      return {...coords, x: coords.x + 1};
    default:
      return {...coords, x: coords.x + 1};
  }
}

const oppositeDirections = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
};

export function isDirectionOpposite(
    original: Direction, changed: Direction): boolean {
  if (oppositeDirections[original] === changed) return true;
  return false;
}

// fn2 is for every frame
export const requestInterval = function(fn, delay: number, fn2) {
  let start = new Date().getTime();
  const handle = {};

  function loop() {
    handle.value = window.requestAnimationFrame(loop);
    const current = new Date().getTime();
    const delta = current - start;
    fn2 && fn2.call();

    if (delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }
  }
  handle.value = window.requestAnimationFrame(loop);

  return handle;
};

/** Repeats the pattern segments till the array size reaches the limit. */
export function getFullPattern(pattern: string[], limit: number): string[] {
  let fullPattern = [];
  for (let i = 0; i < limit; i++) {
    fullPattern.push(pattern[i % pattern.length]);
  }
  return fullPattern;
}