// @ts-check
export {}; // null statement to tell VSCode we're doing a module

// recreate the picture from SVG - but don't use quadratics

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
  throw new Error("Canvas is not HTML Element");
let context = canvas.getContext("2d");
// the derivative of the first point is 2 * (p1 - p0) (in quadratic)
// the derivative of the last point is 2 * (p2 - p1) (in quadratic)
// in cubic, p1 = p0 + 1/3 * the derivative calculated above
context.beginPath();
context.moveTo(150, 100);
context.bezierCurveTo(
  150,
  100 + (50 * 2) / 3,
  100 + (50 * 2) / 3,
  150,
  100,
  150
);
context.bezierCurveTo(100 - (50 * 2) / 3, 150, 50, 100 + (50 * 2) / 3, 50, 100);
context.bezierCurveTo(50, 100 - (50 * 2) / 3, 100 - (50 * 2) / 3, 50, 100, 50);
context.bezierCurveTo(
  100,
  50 + (50 * 2) / 3,
  150 - (50 * 2) / 3,
  100,
  150,
  100
);
context.closePath();
context.fillStyle = "#CCC";
context.fill();
context.strokeStyle = "black";
context.lineWidth = 5;
context.stroke();
