import { A_Star } from "./algos/A*.algo.ts";
import { bfs } from "./algos/bfs.algo.ts";
import { dijkstra } from "./algos/dijkstra.algo.ts";
import { kruskal } from "./algos/kruskal.algo.ts";
import { prim } from "./algos/prim.algo.ts";
import { randomWalkDFS } from "./algos/randomWalkDFS.algo.ts";
import { shuffleCellDirections } from "./algos/randomWalkDFS.utils.ts";
import { recursiveDivider } from "./algos/recursiveDivider.algo.ts";
import { resetShadowStyle, setShadowStyle } from "./canvas_ctx_style_manipulation/shadows.ts";
import { Cell } from "./cell.ts";
import { algosKeys } from "./configs/algos.config.ts";
import { CELLSIZE, CellAnimation, CellStates, CellType, Directions } from "./configs/cell.config.ts";
import { inputDefaults } from "./configs/defaults.ts";
import { globals, iconsState } from "./configs/globals.ts";
import { mouse } from "./configs/input.config.ts";
import { WallState } from "./configs/wall.config.ts";
import { Debuger } from "./debugger.ts";
import { Queue } from "./types/DataStructures/queue.type.ts";
import { Stack } from "./types/DataStructures/stack.type.ts";
import { Frame, algoState } from "./types/algos.types.ts";
import { gridState } from "./types/grid.types.ts";

let first: boolean = true;

export class Grid {
  #startX: number;
  #startY: number;
  #length: number;
  #width: number;
  #offsetLeft: number;
  #offsetTop: number;

  #mousexInGrid: number = 0;
  #mouseyInGrid: number = 0;
  #mouseCellx: number = 0;
  #mouseCelly: number = 0;

  #algos: Map<algosKeys, (grid: Grid) => algoState>;
  gridState: gridState = gridState.IDLE;
  currentAlgo: algosKeys;

  #initialWallState: WallState = WallState.PRESENT;

  grid: Cell[][] = [];

  debuger: Debuger = new Debuger();

  //SECTION - getters and setters

  get startX() {
    return this.#startX;
  }

  get startY() {
    return this.#startY;
  }

  get length() {
    return this.#length;
  }

  get width() {
    return this.#width;
  }

  get offsetLeft() {
    return this.#offsetLeft;
  }

  get offsetTop() {
    return this.#offsetTop;
  }
  //!SECTION 



  //SECTION - initialization methods
  constructor(canvasLength: number, canvasWidth: number, initialWallState: WallState = WallState.PRESENT) {
    //FIXME - this is just for testing
    this.#length = Math.floor(canvasLength / CELLSIZE);
    this.#width = Math.floor(canvasWidth / CELLSIZE);
    // this.#length = 1;
    // this.#width = 1;
    this.#initialWallState = initialWallState;

    this.#algos = new Map<algosKeys, (grid: Grid) => algoState>();
    this.#prepareGrid();
  }

  #prepareGrid() {
    for (let y = 0; y < this.#width; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.#length; x++) {
        this.grid[y][x] = new Cell();
      }
    }
  }

  public initialize(canvasLength: number, canvasWidth: number, wallState: WallState) {

    this.#startX = Math.floor((canvasLength - (this.#length * CELLSIZE)) / 2);
    this.#startY = Math.floor((canvasWidth - (this.#width * CELLSIZE)) * 0.5);

    // globals.canvas!.width = this.#length * CELLSIZE;
    // globals.canvas!.height = this.#width * CELLSIZE;

    this.#currentResetColumn = 0;
    this.#resetPatternDirection = 1;

    this.#offsetLeft = this.#startX;
    this.#offsetTop = this.#startY;
    this.gridState = gridState.IDLE;


    this.path = [];
    this.deadEnds = [];
    for (let y = 0; y < this.#width; y++) {
      for (let x = 0; x < this.#length; x++) {
        let cellx = this.startX + x * CELLSIZE;
        let celly = this.startY + y * CELLSIZE;
        let type: CellType = CellType.air;
        if (x === globals.start.x && y === globals.start.y) {
          type = CellType.start;
        }
        else if (x === globals.finish.x && y === globals.finish.y) {
          type = CellType.finish;
        }

        this.grid[y][x].init(x, y, cellx, celly, CELLSIZE, wallState, type);
      }
    }

    this.#configureCells();
    this.#initAlgos();
  }

  #configureCells() {
    for (let cell of this.eachCell()) {
      let x = cell.gridx;
      let y = cell.gridy;

      cell.north = this.at(x, y - 1);
      cell.south = this.at(x, y + 1);
      cell.east = this.at(x + 1, y);
      cell.west = this.at(x - 1, y);

      if (globals.WallsOn === WallState.ABSENT) {
        cell.link(cell.north);
        cell.link(cell.south);
        cell.link(cell.east);
        cell.link(cell.west);
      }

      if (cell.north === null) {
        cell.walls[Directions.NORTH].setWallState(WallState.PRESENT);
      }
      if (cell.south === null) {
        cell.walls[Directions.SOUTH].setWallState(WallState.PRESENT);
      }
      if (cell.east === null) {
        cell.walls[Directions.EAST].setWallState(WallState.PRESENT);
      }
      if (cell.west === null) {
        cell.walls[Directions.WEST].setWallState(WallState.PRESENT);
      }
    }
  }

  #initAlgos() {
    this.#algos.set(algosKeys.RandomWalkDFS, randomWalkDFS);
    this.#algos.set(algosKeys.recursiveDivider, recursiveDivider);
    this.#algos.set(algosKeys.Kruskal, kruskal);
    this.#algos.set(algosKeys.prim, prim);
    this.#algos.set(algosKeys.BFS, bfs);
    this.#algos.set(algosKeys.Dijkstra, dijkstra);
    this.#algos.set(algosKeys.Astar, A_Star);
  }
  //!SECTION

  //SECTION - uncategorized methods
  public *eachCell() {
    for (let row of this.eachRow()) {
      for (let cell of row) {
        yield cell;
      }
    }
  }

  public *eachRow() {
    for (let y = 0; y < this.#width; y++) {
      yield this.grid[y];
    }
  }

  public at(x: number, y: number) {
    if (x < 0 || x >= this.#length) return null;
    if (y < 0 || y >= this.#width) return null;

    return this.grid[y][x];
  }

  public size() {
    return (this.#length * this.#width);
  }

  public randomCell() {
    let x = Math.floor(Math.random() * this.#length);
    let y = Math.floor(Math.random() * this.#width);

    return this.at(x, y);
  }
  //!SECTION

  // NOTE: algos section
  path: Cell[] = [];
  deadEnds: Cell[] = [];


  public depthFilter() {
    const gridcp = Array<CellStates[]>(this.width);

    for (let y = 0; y < this.#width; y++) {
      gridcp[y] = Array<CellStates>(this.length);
      for (let x = 0; x < this.#length; x++) {
        gridcp[y][x] = CellStates.unvisited;
      }
    }

    const queue: Queue<Frame> = new Queue<Frame>();

    queue.enqueue(new Frame(globals.depthFilterPos.x, globals.depthFilterPos.y, algosKeys.BFS, null));

    this.grid[queue.peek()!.y][queue.peek()!.x].depth = 0;
    gridcp[queue.peek()!.y][queue.peek()!.x] = CellStates.inqueue;

    while (queue.size()) {
      const currentFrame = queue.dequeue();
      const currentCell = this.at(currentFrame!.x, currentFrame!.y);

      if (currentCell!.depth > globals.maxDepth)
        globals.maxDepth = currentCell!.depth;
      for (let cell of currentCell!.neighbors()) {
        if (cell === null) continue;

        if (gridcp[cell!.gridy][cell!.gridx] === CellStates.unvisited && currentCell?.islinked(cell)) {
          cell!.depth = currentCell!.depth + 1;
          gridcp[cell!.gridy][cell!.gridx] = CellStates.inqueue;
          queue.enqueue(new Frame(cell!.gridx, cell!.gridy, algosKeys.BFS, null));
        }
      }

      gridcp[currentFrame!.y][currentFrame!.x] = CellStates.visited;
    }
    if (globals.depthFilterOn)
      globals.gridRedraw = true;
  }

  public animatePath() {
    if (this.path.length === 0) {
      globals.animatePath = false;
      globals.setDisableDepthFilter(false);
      this.gridState = gridState.IDLE;
      globals.hotReload = true;
      return;
    }
    let howMany: number = globals.skipAlgoAnimation ? 7 : 1;

    while ((howMany || globals.hotReload || globals.algoAnimation === false) && this.path.length) {
      const cell = this.path.shift();
      cell!.setState(CellStates.path);
      howMany--;
    }
  }
  private scanDeadEnds() {
    for (let cell of this.eachCell()) {
      if (cell.links().size === 1)
        this.deadEnds.push(cell);
    }
  }

  public launchAlgo() {
    if (this.gridState === gridState.IDLE) {
      this.prepAlgo();
      // if (this.gridState === gridState.SEARCHING)
      // globals.startAlgo = false;
      if (globals.hotReload === false)
        return;
    }
    if (!this.#algos.has(this.currentAlgo)) {
      console.log("ma guy we aint have an algo for what u chose");
      globals.setDisableLaunch(false);
      globals.startAlgo = false;
      return;
    }

    let howMany: number = globals.skipAlgoAnimation ? globals.algoSkipSpeed : 1;
    let state: algoState = algoState.noState;

    while ((howMany || globals.hotReload || globals.algoAnimation === false) && (state === algoState.noState || state === algoState.building || state === algoState.searching)) {
      state = this.#algos.get(this.currentAlgo)!(this);
      howMany--;
    }
    if (state === algoState.done) {
      globals.startAlgo = false;
      if (globals.braid === false) {
        globals.updateDepthFilter = true;
        globals.maxDepth = -1;
      }
      globals.needclear = true;
      globals.setDisableLaunch(false);
      globals.setDisableDepthFilter(false);
      this.gridState = gridState.IDLE;
    }
    else if (state === algoState.foundPath || state === algoState.noPath) {
      if (state === algoState.foundPath)
        globals.algoSpeed = 2; // NOTE: for path animation speed
      if (state === algoState.noPath)
        globals.hotReload = true;
      globals.needclear = true;
      globals.startAlgo = false;
      globals.setDisableLaunch(false);
      globals.setDisableDepthFilter(false);
      this.gridState = gridState.IDLE;
    }
  }

  public braid() {
    if (first) {
      this.scanDeadEnds();
      first = false
    }
    let howMany: number = globals.skipAlgoAnimation ? 7 : 1;

    while (howMany || globals.algoAnimation === false) {
      howMany--;
      const cell = this.deadEnds.pop();
      if (cell === undefined)
        break;
      if (cell.links().size === 1 && Math.random() < globals.braidingChance) {
        if (cell.islinked(cell.north))
          cell.link(cell.south);
        if (cell.islinked(cell.south))
          cell.link(cell.north);
        if (cell.islinked(cell.west))
          cell.link(cell.east);
        if (cell.islinked(cell.east))
          cell.link(cell.west);
      }
    }
    if (this.deadEnds.length === 0 || globals.braidingChance === 0.0) {
      if (globals.braidingChance === 0.0)
        this.deadEnds = [];
      globals.startAlgo = false;
      globals.braid = false;
      globals.setBraidingAnimation(globals.braid);
      globals.updateDepthFilter = true;
      globals.maxDepth = -1;
      if (globals.hotReload) {
        globals.startAlgo = true;
        globals.gridRedraw = true;
      }
      first = true;
    }
  }

  #currentResetColumn: number = 0;
  #resetPatternDirection: number = 1;

  public resetPatternMKI() {
    if (this.#currentResetColumn < 0) {
      if (this.at(this.#currentResetColumn + 1, this.width - 1)!.animationPercentage === 0) {
        this.#currentResetColumn = 0;
        this.#resetPatternDirection = this.#resetPatternDirection * -1;
        globals.reset = false;
        globals.updateDepthFilter = true;
        globals.maxDepth = -1;
        if (globals.startAlgo === false)
          globals.setDisableDepthFilter(false);
      }
      return;
    }
    else if (this.#currentResetColumn >= this.length) {
      if (this.at(this.#currentResetColumn - 1, this.width - 1)!.animationPercentage === 0) {
        this.#currentResetColumn = this.length - 1;
        this.#resetPatternDirection = this.#resetPatternDirection * -1;
        globals.reset = false;
        globals.updateDepthFilter = true;
        globals.maxDepth = -1;
        if (globals.startAlgo === false)
          globals.setDisableDepthFilter(false);
      }
      return;
    }

    let x = this.#currentResetColumn;
    for (let y = 0; y < this.width; y++) {
      // if (this.currentAlgo === algosKeys.Dijkstra)
      //   this.at(x, y)!.setState(CellStates.inqueue);
      // else
      this.at(x, y)!.setState(CellStates.unvisited);
    }

    if (this.at(this.#currentResetColumn, 0)!.animationPercentage >= 10.0)
      this.#currentResetColumn += this.#resetPatternDirection;
  }

  public resetForSearchAlgo() {
    for (let cell of this.eachCell()) {
      cell.parrent = null;
      cell.distenceFromStart = Infinity;
      cell.priority = Infinity;
      if (globals.hotReload)
        cell.setState(CellStates.unvisited);
    }
    if (globals.hotReload)
      globals.reset = false;
  }

  public resetForBuildAlgo() {
    let wallsState: WallState = WallState.PRESENT;

    if (this.currentAlgo === algosKeys.recursiveDivider) {
      wallsState = WallState.ABSENT;
      globals.reset = true;
    }
    for (let cell of this.eachCell()) {
      cell.resetWallAndLinks(wallsState, this.currentAlgo);
      cell.parrent = null;
      cell.distenceFromStart = Infinity;
      cell.priority = Infinity;
    }
  }

  public prepAlgo() {
    if (globals.mazeBuildingAlgorithm && this.gridState === gridState.IDLE) {
      this.gridState = gridState.BUILDING;
      this.currentAlgo = globals.mazeBuildingAlgorithm;
      globals.mazeBuildingAlgorithm = null;
      globals.BuildStack.clear();
      globals.BuildArray = [];
      this.deadEnds = [];
      globals.kruskalNeighbors = [];
      globals.cellsInSet.clear();
      globals.setForCell.clear();
      // if (globals.needclear) {
      globals.reset = true;
      // }
      this.resetForBuildAlgo();

      let frame: Frame;
      const x = Math.floor(this.length * Math.random());
      const y = Math.floor(this.width * Math.random());
      if (this.currentAlgo === algosKeys.recursiveDivider)
        frame = new Frame(0, 0, this.currentAlgo, this.at(0, 0), this.length, this.width);
      else
        frame = new Frame(x, y, this.currentAlgo, this.at(x, y));

      globals.BuildStack.push(frame);
      globals.BuildArray.push(frame);
      if (this.currentAlgo === algosKeys.Kruskal) {
        for (let cell of this.eachCell()) {
          const setId = globals.setForCell.size;

          globals.setForCell.set(cell, setId);
          globals.cellsInSet.set(setId, [cell]);


          if (cell.north)
            globals.kruskalNeighbors.push([cell, cell.north]);
          if (cell.east)
            globals.kruskalNeighbors.push([cell, cell.east]);
        }
        globals.kruskalNeighbors.sort(() => Math.random() - 0.5);
      }
    }
    else if (globals.mazeSolvingAlgorithm && this.gridState === gridState.IDLE) {
      this.gridState = gridState.SEARCHING;
      this.currentAlgo = globals.mazeSolvingAlgorithm;
      globals.searchQueue.clear();
      globals.minQueue.clear();
      this.path = [];
      // if (globals.needclear) {
      globals.reset = true;
      this.resetForSearchAlgo();
      // }
      const frame = new Frame(globals.start.x, globals.start.y, this.currentAlgo, this.at(globals.start.x, globals.start.y));

      this.at(frame.x, frame.y)!.parrent = null;
      this.at(frame.x, frame.y)!.distenceFromStart = 0;
      this.at(frame.x, frame.y)!.priority = 0;

      globals.searchQueue.enqueue(frame);

      if (this.currentAlgo === algosKeys.Dijkstra) {
        for (let cell of this.eachCell()) {
          globals.minQueue.enqueue(cell);
        }
      }
      if (this.currentAlgo === algosKeys.Astar) {
        const cell = this.at(frame.x, frame.y);
        if (cell)
          globals.minQueue.enqueue(cell);
      }
    }
    else {
      globals.startAlgo = false;
      this.gridState = gridState.IDLE;
      globals.setDisableLaunch(false);
      globals.setDisableDepthFilter(false);
    }
  }
  //

  //SECTION - animation methods

  public update(ctx: CanvasRenderingContext2D) {

    // if (globals.replaceDepthFilterPos &&
    //   (globals.depthFilterPos.oldx >= 0 && globals.depthFilterPos.oldx < this.length && globals.depthFilterPos.oldy >= 0 && globals.depthFilterPos.oldy < this.width)) {
    //   if (globals.depthFilterPos.oldx === globals.placeholders.filterx && globals.depthFilterPos.oldy === globals.placeholders.filtery)
    //     this.grid[globals.depthFilterPos.oldy][globals.depthFilterPos.oldx].setCellType(CellType.weighted);
    //   else
    //     this.grid[globals.depthFilterPos.oldy][globals.depthFilterPos.oldx].setCellType(CellType.air);
    // }
    //
    // if (globals.replaceDepthFilterPos &&
    //   (globals.depthFilterPos.x >= 0 && globals.depthFilterPos.x < this.length && globals.depthFilterPos.y >= 0 && globals.depthFilterPos.y < this.width)) {
    //   if (this.at(globals.depthFilterPos.x, globals.depthFilterPos.y)?.cellType === CellType.weighted) {
    //     globals.placeholders.filterx = globals.depthFilterPos.x;
    //     globals.placeholders.filtery = globals.depthFilterPos.y;
    //   }
    //   this.grid[globals.depthFilterPos.y][globals.depthFilterPos.x].setCellType(CellType.filter);
    // }


    if (globals.replaceStart === iconsState.replaced &&
      (globals.start.oldx >= 0 && globals.start.oldx < this.length && globals.start.oldy >= 0 && globals.start.oldy < this.width)) {
      if (globals.start.oldx === globals.placeholders.startx && globals.start.oldy === globals.placeholders.starty) {
        this.grid[globals.start.oldy][globals.start.oldx].setCellType(CellType.weighted);
      }
      else {
        this.grid[globals.start.oldy][globals.start.oldx].setCellType(CellType.air);
      }
    }

    if (globals.replaceStart === iconsState.replaced &&
      (globals.start.x >= 0 && globals.start.x < this.length && globals.start.y >= 0 && globals.start.y < this.width)) {
      if (this.at(globals.start.x, globals.start.y)?.cellType === CellType.weighted) {
        globals.placeholders.startx = globals.start.x;
        globals.placeholders.starty = globals.start.y;
      }
      this.grid[globals.start.y][globals.start.x].setCellType(CellType.start);
      globals.replaceStart = iconsState.replacing;
    }

    if (globals.replaceFinish === iconsState.replaced &&
      (globals.finish.oldx >= 0 && globals.finish.oldx < this.length && globals.finish.oldy >= 0 && globals.finish.oldy < this.width)) {
      if (globals.finish.oldx === globals.placeholders.finishx && globals.finish.oldy === globals.placeholders.finishy) {
        this.grid[globals.finish.oldy][globals.finish.oldx].setCellType(CellType.weighted);
      }
      else
        this.grid[globals.finish.oldy][globals.finish.oldx].setCellType(CellType.air);
    }

    if (globals.replaceFinish === iconsState.replaced &&
      (globals.finish.x >= 0 && globals.finish.x < this.length && globals.finish.y >= 0 && globals.finish.y < this.width)) {
      if (this.at(globals.finish.x, globals.finish.y)?.cellType === CellType.weighted) {
        globals.placeholders.finishx = globals.finish.x;
        globals.placeholders.finishy = globals.finish.y;
      }
      this.grid[globals.finish.y][globals.finish.x].setCellType(CellType.finish);
      globals.replaceFinish = iconsState.replacing;
    }

    globals.mouseUpdating = false;

    if (globals.reset && globals.resetAnimation === false && globals.hotReload === false) {
      for (let cell of this.eachCell()) {
        cell.setState(CellStates.unvisited);
        cell.setToOrigineAnimationRequirementsFromInside();
      }
      globals.gridRedraw = true;
      globals.reset = false;
      globals.updateDepthFilter = true;
      globals.maxDepth = -1;
      if (globals.startAlgo === false)
        globals.setDisableDepthFilter(false);
    }
    else if (globals.reset && globals.resetAnimation && globals.hotReload === false) {
      this.resetPatternMKI();
    }

    for (let cell of this.eachCell()) {
      cell.update();
    }
  }

  public writeMousePosition(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";


    ctx.fillText("x: " + this.#mouseCellx + " y: " + this.#mouseCelly, 200, this.#offsetTop - 10);
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, globals.canvas!.width, this.#offsetTop);
    ctx.clearRect(0, 0, this.#offsetLeft, globals.canvas!.height);
    ctx.clearRect(0, globals.canvas!.height - this.#offsetTop, globals.canvas!.width, this.#offsetTop);
    ctx.clearRect(globals.canvas!.width - this.#offsetLeft, 0, this.#offsetLeft, globals.canvas!.height);
    // ctx.clearRect(this.startX, this.startY, this.#length * CELLSIZE, this.#width * CELLSIZE);

    for (let cell of this.eachCell()) {
      if (cell.animation === CellAnimation.STOPPED || cell.animation === CellAnimation.STOPPING) {
        if (cell.gridx !== this.#mouseCellx || cell.gridy !== this.#mouseCelly || !globals.debugModeOn)
          cell.draw(ctx);
      }
    }


    for (let cell of this.eachCell()) {
      if (cell.animation !== CellAnimation.STOPPED) {
        if (cell.gridx !== this.#mouseCellx || cell.gridy !== this.#mouseCelly || !globals.debugModeOn) {
          cell.draw(ctx);
        }
      }
    }

    if (globals.debugModeOn) {
      setShadowStyle(ctx, { blur: 5, color: "gold" })
      this.at(this.#mouseCellx, this.#mouseCelly)?.draw(ctx);
      resetShadowStyle(ctx);
    }
    globals.gridRedraw = false;
  }



  public updateDebuger(ctx: CanvasRenderingContext2D) {
    if (!globals.debugModeOn) return;

    this.#mousexInGrid = mouse.dx - this.#offsetLeft;
    this.#mouseyInGrid = mouse.dy - this.#offsetTop;


    this.#mouseCellx = Math.floor(this.#mousexInGrid / CELLSIZE);
    this.#mouseCelly = Math.floor(this.#mouseyInGrid / CELLSIZE);

    this.debuger.update();
  }

  public drawDebuger(ctx: CanvasRenderingContext2D) {

    if (!globals.debugModeOn) {
      return;
    }
    // this.writeMousePosition(ctx);
    this.debuger.draw(ctx, this.at(this.#mouseCellx, this.#mouseCelly), this);
  }

  //!SECTION
}
