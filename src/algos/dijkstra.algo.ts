import { Bounce, toast } from "react-toastify";
import { Cell } from "../cell";
import { CellStates, Directions } from "../configs/cell.config";
import { globals } from "../configs/globals";
import { Grid } from "../grid";
import { Frame, algoState } from "../types/algos.types";

function preparePath(grid: Grid, currentCell: Cell) {
  globals.skipAlgoAnimaiton = false;
  console.log("yeeep there is a path");
  globals.animatePath = true;
  let cell = currentCell;
  while (!(cell.gridx === globals.start.x && cell.gridy === globals.start.y)) {
    grid.path.push(cell);
    cell = cell.parrent as unknown as Cell;
  }
  grid.path.push(cell);
}

export function dijkstra(grid: Grid) {

  if (globals.minQueue.size() === 0) {
    globals.skipAlgoAnimaiton = false;
    console.log("there is no Path");
    toast.error("there is no path", {
      position: "top-center",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
    return algoState.noPath;
  }

  const current = globals.minQueue.dequeue();
  const currentCell = grid.at(current!.x, current!.y);

  if (currentCell === null) {
    globals.skipAlgoAnimaiton = false;
    console.log("there is no cell here bro");
    // globals.handletoast();
    return algoState.noPath;
  }

  if (currentCell.gridx === globals.finish.x && currentCell.gridy === globals.finish.y) {
    preparePath(grid, currentCell);
    return algoState.foundPath;
  }

  let nextDirection: Directions | undefined = undefined;

  while (current!.moves.length) {
    nextDirection = current!.moves.pop();

    if (nextDirection === undefined)
      continue;

    let nextCell = grid.at(current!.x, current!.y)!.neighbor(nextDirection);
    if (nextCell && nextCell!.state === CellStates.unvisited && currentCell.islinked(nextCell)) {
      nextCell!.setState(CellStates.inqueue);
      nextCell!.parrent = currentCell;
      nextCell!.distenceFromStart = nextCell!.parrent!.distenceFromStart + 1;

      let frame: Frame = new Frame(nextCell!.gridx, nextCell!.gridy, grid.currentAlgo, nextCell!.weight);
      globals.minQueue.enqueue(frame);
      if (nextCell.gridx === globals.finish.x && nextCell!.gridy === globals.finish.y) {
        preparePath(grid, nextCell);
        return algoState.foundPath;
      }
    }
  }
  currentCell.setState(CellStates.visited);
  if (globals.minQueue.size())
    grid.at(globals.minQueue.peek()!.x, globals.minQueue.peek()!.y)?.setState(CellStates.current);

  return algoState.searching;
}

