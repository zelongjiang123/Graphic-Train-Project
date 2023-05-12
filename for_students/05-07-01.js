// @ts-check

import { runCanvas } from "../libs/CS559/runCanvas.js";
import { decastle } from "./05-07-decastlejau.js";


/* no need for onload - we use defer */

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let context = canvas.getContext("2d");
function draw(canvas, t) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(40, 40);
    decastle(
      context,
      [
        [0, 0],
        [0, 120]
      ],
      t,
      2
    );
    context.translate(40, 0);
    decastle(
      context,
      [
        [0, 120],
        [60, 0],
        [120, 120]
      ],
      t,
      20
    );
    context.translate(160, 0);
    decastle(
      context,
      [
        [0, 120],
        [0, 0],
        [120, 0],
        [120, 120]
      ],
      t,
      20
    );
    context.translate(160, 0);
    decastle(
      context,
      [
        [10, 120],
        [0, 40],
        [80, 0],
        [160, 40],
        [150, 120]
      ],
      t,
      20
    );
    context.restore();
}
runCanvas(canvas, draw, 0, true, 0, 1, 0.02);


