// @ts-check

import { runCanvas } from "../libs/CS559/runCanvas.js";
import { functionGallery } from "./05-01-curves.js";

/* no onload - since we can use defer */

// note that checking that canvas is the right type of element tells typescript
// that this is the right type - it's a form of a safe cast
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
  throw new Error("Canvas is not HTML Element");

let context = canvas.getContext("2d");

// a function to fill in a canvas (do the drawing) in an animation
// loop - the form of this function is meant to be used with
// "runcanvas" which is defined in another file
// runcanvas will take a function that takes 2 arguments (a canvas and a time)
function draw1(canvas, t) {
  if (!(context instanceof CanvasRenderingContext2D))
    throw new Error("Context is not a Context!");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(20, 40);
  functionGallery(context, t, 0);
  context.restore();
}

// use the library code to set up a drawing canvas with a time slider, a start/stop button
// and an animation loop that makes it go.
// the important thing is that it takes a function that is called for drawing
// the content of the canvas
runCanvas(canvas, draw1, 0, true, 0, 1, 0.02);
/*
context.strokeStyle = "black";

context.save();
context?.beginPath();
context?.moveTo(20, 20);
context.strokeStyle = "red";
context?.lineTo(100, 20);
context.strokeStyle = "green";
context?.stroke();

context?.lineTo(60, 80);
context.strokeStyle = "blue";
context?.stroke();
context?.restore();
context?.beginPath();
context?.moveTo(60, 80);
context?.lineTo(20, 20);
context.strokeStyle = "purple";
context?.stroke();*/
