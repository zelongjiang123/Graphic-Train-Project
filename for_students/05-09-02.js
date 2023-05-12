// @ts-check
export {}; // null statement to tell VSCode we're doing a module

// draw a picture using curves!

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
  throw new Error("Canvas is not HTML Element");
let context = canvas.getContext("2d");
context.beginPath();
context.moveTo(80, 100);
context.bezierCurveTo(100, 80, 120, 70, 130, 100);
context.bezierCurveTo(140, 130, 160, 130, 180, 100);
context.bezierCurveTo(200, 70, 200, 60, 220, 100);
context.bezierCurveTo(180, 300, 120, 400, 80, 100);
context.closePath();
context.fillStyle = "pink";
context.fill();
context.stroke();
