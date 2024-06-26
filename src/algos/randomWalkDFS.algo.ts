import { Cell } from "../cell";
import { CellStates, Directions } from "../configs/cell.config";
import { globals } from "../configs/globals";
import { Grid } from "../grid";
import { Frame, algoState } from "../types/algos.types";


export function randomWalkDFS(grid: Grid): algoState {

  let currentFrame: Frame | undefined = undefined;
  let nextCell: Cell | null = null;
  let currentCell: Cell | null = null;

  while (nextCell === null) {
    currentFrame = globals.BuildStack.peek();
    if (!currentFrame)
      break;

    currentCell = grid.at(currentFrame.x, currentFrame.y)
    currentCell!.setState(CellStates.visited);

    let nextDirection: Directions | undefined = undefined;

    while (currentFrame.moves.length) {

      nextDirection = currentFrame.moves.pop();
      if (nextDirection === undefined)
        break;

      nextCell = currentCell!.neighbor(nextDirection);
      if (nextCell === null || nextCell.state !== CellStates.unvisited) {
        nextCell = null;
        nextDirection = undefined;
        continue;
      }
      else {
        nextCell!.setState(CellStates.current);
        break;
      }
    }

    if (nextDirection === undefined) {
      // currentCell?.setState(CellStates.visited);
      globals.BuildStack.pop();
    }
    if (nextCell)
      break;
  }

  if (currentFrame === undefined) {
    return algoState.done;
  }


  const toPush = new Frame(nextCell!.gridx, nextCell!.gridy, grid.currentAlgo, nextCell);

  currentCell!.link(nextCell, true);

  globals.BuildStack.push(toPush);
  return algoState.building;
}
