import { Bounce, toast } from "react-toastify";
import { Cell } from "../cell";
import { CellStates, Directions } from "../configs/cell.config";
import { globals } from "../configs/globals";
import { Grid } from "../grid";
import { Frame, algoState } from "../types/algos.types";


export function bfs(grid: Grid) {

  if (globals.searchQueue.size() === 0) {
    if (globals.hotReload === false)
      toast.error("No Path Found", {
        position: "top-center",
        autoClose: 3000,
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

  const current = globals.searchQueue.dequeue();
  const currentCell = grid.at(current!.x, current!.y);

  if (currentCell === null) {
    if (globals.hotReload === false)
      toast.error("No Path Found", {
        position: "top-center",
        autoClose: 3000,
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

  if (currentCell.gridx === globals.finish.x && currentCell.gridy === globals.finish.y) {
    globals.animatePath = true;
    let cell = currentCell;
    while (!(cell.gridx === globals.start.x && cell.gridy === globals.start.y)) {
      grid.path.push(cell);
      cell = cell.parrent as unknown as Cell;
    }
    grid.path.push(cell);
    if (globals.hotReload === false)
      toast.success("Path Found", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
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

      let frame: Frame = new Frame(nextCell!.gridx, nextCell!.gridy, grid.currentAlgo, nextCell);
      globals.searchQueue.enqueue(frame);
    }
  }
  currentCell.setState(CellStates.visited);
  if (globals.searchQueue.size())
    grid.at(globals.searchQueue.peek()!.x, globals.searchQueue.peek()!.y)?.setState(CellStates.current);

  return algoState.searching;
}
