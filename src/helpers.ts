import {BOARD_HEIGHT, BOARD_WIDTH, Coords, Direction} from './constants';

export function getStartingCoords(snakeCount: number, index: number) {
  return {
    x: Math.floor(BOARD_WIDTH / (snakeCount + 1) * (index + 1)),
    y: Math.floor(BOARD_HEIGHT / (snakeCount + 1) * (index + 1)),
  };
}

// TODO: exclude array of coords
export function getRandomCoords(bounds: Coords): Coords {
  return {
    x: Math.floor(Math.random() * bounds.x),
        y: Math.floor(Math.random() * bounds.y),
  }
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
}

export function isDirectionOpposite(original: Direction, changed: Direction):
    boolean {
      if (oppositeDirections[original] === changed) return true;
      return false
    };

export const requestInterval = function(fn, delay: number) {
  let start = new Date().getTime();
  const handle = {};

  function loop() {
    console.log('----loop');
    handle.value = window.requestAnimationFrame(loop);
    let current = new Date().getTime()
    let delta = current - start;
    if (delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }
  }
  handle.value = window.requestAnimationFrame(loop);

  return handle;
};
