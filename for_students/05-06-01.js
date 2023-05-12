// @ts-check

import { runCanvas } from "../libs/CS559/runCanvas.js";
import { decastle } from "./05-07-decastlejau.js";
import { draggablePoints } from "../libs/CS559/dragPoints.js";


/* no need for onload - we use defer */

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let pts =       [
    [0, 0],
    [0, 120],

    [0, 120],
    [60, 0],
    [120, 120],

    [0, 120],
    [0, 0],
    [120, 0],
    [120, 120],

    [10, 120],
    [0, 40],
    [80, 0],
    [160, 40],
    [150, 120]
  ];

for (let i=0; i<pts.length; i++) pts[i][1]+=40;
for (let i=0; i<pts.length; i++) pts[i][0]+=40;
for (let i=2; i<pts.length; i++) pts[i][0]+=40;
for (let i=5; i<pts.length; i++) pts[i][0]+=160;
for (let i=9; i<pts.length; i++) pts[i][0]+=160;

let context = canvas.getContext("2d");
function draw(canvas, t) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    decastle(
      context,
      pts.slice(0,2),
      t,
      2, false
    );
    let p3=[];
    decastle(
      context,
      pts.slice(2,5),
      t,
      20,false
    );
    decastle(
      context,
      pts.slice(5,9),
      t,
      20,false
    );
    decastle(
      context,
      pts.slice(9,15),
      t,
      20,false
    );
    context.restore();
}
runCanvas(canvas, draw, 0, true, 0, 1, 0.02);

let slider = /** @type {HTMLInputElement} */ (document.getElementById("canvas1-slider"));
draggablePoints(canvas, pts, function() {
    draw(canvas, Number(slider.value));
});
