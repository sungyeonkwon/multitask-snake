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
export class BreathFirstSearch {
  boardState: boolean[][];
  width: number;
  height: number;
  start: Coords;
  goal: Coords;
  qf?: QueueFrontier;

  constructor(
      boardState: boolean[][],
      snakeHead: Coords,
      goal: Coords,
  ) {
    this.boardState = boardState;
    this.start = snakeHead;
    this.goal = goal;
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

    const exploredCoords: Array<boolean[]> = [];
    for (let y = 0; y < this.height; y++) {
      exploredCoords[y] = [];
      for (let x = 0; x < this.width; x++) {
        exploredCoords[y].push(false);
      }
    }

    while (!this.qf.isEmpty) {
      // Choose a node from the queue frontier
      const node = this.qf.dequeue();

      // Mark node as explored
      exploredCoords[node.coords.y][node.coords.x] = true;

      // Found the goal
      if (node.coords.x === this.goal.x && node.coords.y === this.goal.y) {
        // Trace back the path
        let track = [];
        let nodeToTrack = node;
        while (!!nodeToTrack.parent) {
          track.unshift(nodeToTrack);
          nodeToTrack = nodeToTrack.parent;
        }
        const actions = track.map(node => node.action);
        return actions;
      }

      // Add neighbors to the queue frontier
      for (const [direction, neighbourCoords] of this.getNeighbours(
               node.coords)) {
        const explored = exploredCoords[neighbourCoords.y][neighbourCoords.x];
        if (!this.qf.containsCoords(neighbourCoords) && !explored &&
            this.boardState[neighbourCoords.y][neighbourCoords.x]) {
          this.qf.enqueue(new Node(neighbourCoords, direction, node));
        }
      }
    }
    console.log('🤡 Frontier is empty. There is no possible solution.');
    return [];
  }
}