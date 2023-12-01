import { FADEIN, FADEOUT, Wall } from "./wall.js";

export const OUTWARDS = 0;
export const INWARDS = 1;
export const STOPPED = 2;
export const TOORIGINAL = 3;

export const NORTH = 0;
export const EAST = 1;
export const SOUTH = 2;
export const WEST = 3;

export class Cell {
  gridX;
  gridY;
  visited;

  x;
  y;
  length;

  Velocity;
  Acceleration;
  animation;
  color = {
    r: 175,
    g: 216,
    b: 248,
    //NOTE - revisit this becuase it is not very tidy
    alpha: 0.5,
  };

  inwardScallingFactor;
  outwardScallingFactor;

  xOutwardWidth;
  xOutwardSteps;
  firstCellVector = {
    startx: 0,
    starty: 0,
    endx: 0,
    endy: 0,
    currentx: 0,
    currenty: 0,
    currentlength: 0,
    moves: { x: 0, y: 0, d: 1 },
  };

  walls = [];

  constructor(gridX, gridY, x, y, length, wallsState) {
    this.gridX = gridX; // x position in the grid
    this.gridY = gridY; // y position in the grid
    this.visited = false; // has this cell been visited by the algorithm?

    this.x = x; // x position on canvas
    this.y = y; // y position on canvas
    this.length = length; // length of the cell on canvas
    this.Velocity = 40; // velocity of the cell
    this.Acceleration = 0; // acceleration of the cell
    this.animation = OUTWARDS; // animation state

    this.inwardScallingFactor = 0.2; // how much to scale the cell inwards
    this.outwardScallingFactor = 0.2; // how much to scale the cell outwards


    this.firstCellVector.x = this.x;
    this.firstCellVector.y = this.y;

    let startLength = this.length * this.inwardScallingFactor * this.firstCellVector.moves.d;

    this.firstCellVector.startx = this.firstCellVector.x + startLength;
    this.firstCellVector.starty = this.firstCellVector.y + startLength;

    let endLength = this.length * this.outwardScallingFactor * this.firstCellVector.moves.d;

    this.firstCellVector.endx = this.firstCellVector.x - endLength;
    this.firstCellVector.endy = this.firstCellVector.y - endLength;

    this.xOutwardWidth = (endLength * 2) + startLength;
    this.xOutwardSteps = 0;


    this.firstCellVector.currentx = this.firstCellVector.startx;
    this.firstCellVector.currenty = this.firstCellVector.starty;
    this.firstCellVector.currentlength = this.length - (this.length * this.inwardScallingFactor * 2);



    for (let i = NORTH; i < 4; i++) {
      let wall = new Wall(i, this.x, this.y, this.length, { r: 12, g: 53, b: 71, alpha: 0 }, wallsState);

      this.walls.push(wall);
    }

    console.log("constructor debug");
    this.debug();
  }

  debug() {
    console.log("this is the this.x = >", this.x);
    console.log("this is the this.y = >", this.y);
    console.log("this is the this.length = >", this.length);
    console.log("this is the this.Velocity = >", this.Velocity);
    console.log("this is the this.Acceleration = >", this.Acceleration);
    console.log("this is the this.animation = >", this.animation);
    console.log("this is the this.color = >", this.color);
    console.log("this is the this.inwardScallingFactor = >", this.inwardScallingFactor);
    console.log("this is the this.outwardScallingFactor = >", this.outwardScallingFactor);
    console.log("this is the this.xOutwardWidth = >", this.xOutwardWidth);
    console.log("this is the this.xOutwardSteps = >", this.xOutwardSteps);
    console.log("this is the this.firstCellVector.moves = >", this.firstCellVector.moves);
    console.log("this is the this.firstCellVector.x= >", this.firstCellVector.x);
    console.log("this is the this.firstCellVector.y = >", this.firstCellVector.y);
    console.log("this is the this.firstCellVector.startx = >", this.firstCellVector.startx);
    console.log("this is the this.firstCellVector.starty = >", this.firstCellVector.starty);
    console.log("this is the this.firstCellVector.endx = >", this.firstCellVector.endx);
    console.log("this is the this.firstCellVector.endy = >", this.firstCellVector.endy);
    console.log("this is the this.firstCellVector.currentx = >", this.firstCellVector.currentx);
    console.log("this is the this.firstCellVector.currenty = >", this.firstCellVector.currenty);
    console.log("this is the this.firstCellVector.currentlength = >", this.firstCellVector.currentlength);
    console.log("this is the this.firstCellVector.moves = >", this.firstCellVector.moves);
    console.log("this is the walls = >", this.walls);
    console.log("--------------------------------");
  }

  setVelocityAnimation(animation) {

    if (animation != OUTWARDS)
      return;

    this.animation = animation;
    this.Velocity = this.Velocity < 0 ? -this.Velocity : this.Velocity;
  }

  update(ctx) {


    if (this.animation == STOPPED) {
      this.draw(ctx);
      return;
    }

    const FPS = 60; // Frames per second
    const DELTA = 1 / FPS; // Delta time

    let step = this.Velocity * -this.firstCellVector.moves.d * DELTA;
    // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    // console.log("step = ", step);
    // console.log("this.firstCellVector.currentx + step = ", this.firstCellVector.currentx + step);
    // this.debug();
    if (this.animation == INWARDS &&
      (this.firstCellVector.currentx + step >= this.firstCellVector.startx ||
        this.firstCellVector.currenty + step >= this.firstCellVector.starty)) {

      this.animation = OUTWARDS;
      this.Velocity = this.Velocity < 0 ? -this.Velocity : this.Velocity;

      this.firstCellVector.currentx = this.firstCellVector.startx;
      this.firstCellVector.currenty = this.firstCellVector.starty;

    }
    else if (this.animation == OUTWARDS &&
      (this.firstCellVector.currentx + step <= this.firstCellVector.endx ||
        this.firstCellVector.currenty + step <= this.firstCellVector.endy)) {

      this.animation = TOORIGINAL;
      this.Velocity = this.Velocity > 0 ? -this.Velocity : this.Velocity;

      this.firstCellVector.currentx = this.firstCellVector.endx;
      this.firstCellVector.currenty = this.firstCellVector.endy;

      // let startLength = this.length * this.inwardScallingFactor * this.firstCellVector.moves.d;
      // let endLength = this.length * this.outwardScallingFactor * this.firstCellVector.moves.d;

      // this.xOutwardSteps = startLength + endLength;

    }
    else if (this.animation == TOORIGINAL &&
      (this.firstCellVector.currentx + step >= this.firstCellVector.x ||
        this.firstCellVector.currenty + step >= this.firstCellVector.y)) {

      this.animation = STOPPED;

      this.firstCellVector.currentlength = this.length;

      this.firstCellVector.currentx = this.firstCellVector.x;
      this.firstCellVector.currenty = this.firstCellVector.y;

      let endLength = this.length * this.outwardScallingFactor * this.firstCellVector.moves.d;

      this.xOutwardSteps = 0;
      this.xOutwardWidth = endLength * 2;

      //REVIEW - this is really bad, we need to find a better way to do this
      for (let i = NORTH; i < 4; i++) {
        this.walls[i].color.alpha = this.walls[i].animation;
        this.walls[i].animation = STOPPED;
        // this.walls[i].update(this.firstCellVector.currentx, this.firstCellVector.currenty, this.firstCellVector.currentlength, this.walls[i].color.alpha);
      }
    }
    else {
      this.firstCellVector.currentx += step;
      this.firstCellVector.currenty += step;

      this.firstCellVector.currentlength += -step * 2;
      this.xOutwardSteps += step < 0 ? -step : step;
    }


    for (let i = NORTH; i < 4; i++) {
      if (this.walls[i].animation == FADEIN)
        this.walls[i].color.alpha = this.xOutwardSteps / this.xOutwardWidth;
      else if (this.walls[i].animation == FADEOUT)
        this.walls[i].color.alpha = 1 - (this.xOutwardSteps / this.xOutwardWidth);

      // we need to make sure that the alpha is between 0 and 1
      this.walls[i].color.alpha = this.walls[i].color.alpha > 1 ? 1 : this.walls[i].color.alpha;
      this.walls[i].color.alpha = this.walls[i].color.alpha < 0 ? 0 : this.walls[i].color.alpha;

      //NOTE - revisit this becuase it is not very tidy
      this.color.alpha += (this.xOutwardSteps / this.xOutwardWidth) * 0.5;

      //we need to make sure that the alpha is between 0 and 1
      this.color.alpha = this.color.alpha > 1 ? 1 : this.color.alpha;
      this.color.alpha = this.color.alpha < 0 ? 0 : this.color.alpha;
      // console.log("this.walls[i].color.alpha = ", this.walls[i].color.alpha);
      // console.log("this.xOutwardSteps = ", this.xOutwardSteps);
      // console.log("this.xOutwardWidth = ", this.xOutwardWidth);
      // console.log("this.xOutwardSteps / (this.xOutwardWidth) = ", this.xOutwardSteps / this.xOutwardWidth);
      // console.log("1 - (this.xOutwardSteps / (this.xOutwardWidth)) = ", 1 - (this.xOutwardSteps / this.xOutwardWidth));
      // console.log("-------------------------------");

      this.walls[i].update(this.firstCellVector.currentx, this.firstCellVector.currenty, this.firstCellVector.currentlength, this.walls[i].color.alpha);
    }
    // this.debug();
    // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

    this.draw(ctx);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.alpha})`;
    ctx.rect(
      this.firstCellVector.currentx,
      this.firstCellVector.currenty,
      this.firstCellVector.currentlength,
      this.firstCellVector.currentlength
    );
    ctx.fill();

    for (let i = NORTH; i < 4; i++) {
      // if (this.walls[i].animation != STOPPED)
      this.walls[i].draw(ctx);
    }

    // ctx.beginPath();
    // ctx.strokeRect(
    //   this.firstCellVector.x,
    //   this.firstCellVector.y,
    //   this.length,
    //   this.length
    // );
    // ctx.strokeStyle = "blue";
    // ctx.stroke();
  }
}
