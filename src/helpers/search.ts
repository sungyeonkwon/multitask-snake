import {Coords, Direction} from '../constants';

export class Node {
  coords: Coords;
  action: Direction;
  parent?: Node;

  constructor(coords: Coords, action: Direction, parent?: Node) {
    this.coords = coords;
    this.action = action;
    this.parent = parent;
  }
}

export class QueueFrontier {
  frontier: Node[] = [];

  get isEmpty(): boolean {
    return this.frontier.length === 0;
  }

  enqueue(node: Node) {
    this.frontier.push(node);
  }

  dequeue() {
    if (this.isEmpty) {
      console.log('Empty frontier');
      return;
    } else {
      return this.frontier.shift();
    }
  }

  containsCoords(coords: Coords): boolean {
    return this.frontier.some(
        (node) => node.coords.x === coords.x && node.coords.y === coords.y);
  }

  reset() {
    this.frontier = [];
  }
}

// TODO: Add test
/** Search that enemy snake performs to reach target food */
export class BreadthFirstSearch {
  boardState: boolean[][];
  foodState: boolean[][];
  width: number;
  height: number;
  start: Coords;
  qf?: QueueFrontier;

  constructor(
      boardState: boolean[][],
      foodState: boolean[][],
      snakeHead: Coords,
  ) {
    this.boardState = boardState;
    this.foodState = foodState;
    this.start = snakeHead;
    this.height = boardState.length;
    this.width = boardState[0].length;
  }

  getNeighbours(coord: Coords): Array<[Direction, Coords]> {
    const {x, y} = coord;
    const candidates: Array<[Direction, Coords]> = [
      [Direction.UP, {x, y: y - 1}],
      [Direction.DOWN, {x, y: y + 1}],
      [Direction.LEFT, {x: x - 1, y}],
      [Direction.RIGHT, {x: x + 1, y}],
    ];

    let result = [];
    for (let candidate of candidates) {
      const cX = candidate[1].x;
      const cY = candidate[1].y;

      if (cX >= 0 && cY >= 0 && cY < this.height && cX < this.width &&
          this.boardState[cY][cX]) {
        result.push(candidate);
      }
    }
    return result;
  }

  /** Finds the shortest path to the goal with queue frontier. */
  solve(currentDirection?: Direction): Direction[] {
    const root = new Node(this.start, currentDirection);
    this.qf = new QueueFrontier();
    this.qf.enqueue(root);

    const exploredCoords: boolean[][] = [];
    for (let y = 0; y < this.height; y++) {
      exploredCoords[y] = [];
      for (let x = 0; x < this.width; x++) {
        exploredCoords[y].push(false);
      }
    }

    while (!this.qf.isEmpty) {
      // Choose a node from the queue frontier
      let node = this.qf.dequeue();

      // Mark node as explored
      exploredCoords[node.coords.y][node.coords.x] = true;

      // Found the goal
      if (this.foodState[node.coords.y][node.coords.x]) {
        let trace = [];
        while (!!node.parent) {
          trace.push(node);
          node = node.parent;
        }
        return trace.reverse().map(node => node.action);
      }

      // Add neighbors to the queue frontier
      for (const [direction, coords] of this.getNeighbours(node.coords)) {
        const explored = exploredCoords[coords.y][coords.x];
        if (!this.qf.containsCoords(coords) && !explored &&
            this.boardState[coords.y][coords.x]) {
          this.qf.enqueue(new Node(coords, direction, node));
        }
      }
    }
    console.log('🤡 Frontier is empty. There is no possible solution.');
    return [];
  }
}