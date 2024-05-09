import { shuffleCellDirections } from "../algos/randomWalkDFS.utils";
import { algosKeys } from "../configs/algos.config";
import { Directions } from "../configs/cell.config";

export enum algoState {
  noState,
  searching,
  building,
  foundPath,
  noPath,
  done,
}

export enum SplitDirection {
  H,
  V,
}

interface BuildWall {
  state: algoState,
  direction: Directions,
  splitPos: number,
  splitDirection: SplitDirection,
  doorIndex: number,
  x: number,
  y: number,
  dx: number,
  dy: number,
}

export class Frame {
  x: number;
  y: number;
  moves: Directions[];


  // NOTE: recursive divider
  length: number;
  width: number;
  buildingWall: BuildWall;

  constructor(x: number, y: number, algo: algosKeys, length: number = 0, width: number = 0) {
    this.x = x;
    this.y = y;

    // console.log(algo);
    if (algo === algosKeys.RandomWalkDFS)
      this.moves = shuffleCellDirections(shuffleCellDirections([Directions.NORTH, Directions.EAST, Directions.SOUTH, Directions.WEST]));
    else if (algo === algosKeys.BFS)
      this.moves = [Directions.EAST, Directions.SOUTH, Directions.WEST, Directions.NORTH];

    this.length = length;
    this.width = width;
    this.buildingWall = {
      state: algoState.noState,
      direction: Directions.EAST,
      splitPos: 0,
      splitDirection: SplitDirection.V,
      doorIndex: 0,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
    };
  }
}
