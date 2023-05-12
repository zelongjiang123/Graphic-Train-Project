// @ts-check

import { draggablePoints } from "../libs/CS559/dragPoints.js";
import { runCanvas } from "../libs/CS559/runCanvas.js";
import { decastle } from "./05-07-decastlejau.js";

/* no need for onload - we use defer */

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");
let context = canvas.getContext("2d");
let pts = [
    [100, 300],
    [100, 100],
    [300, 100],
    [300, 300]
];

function draw(canvas, t) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    decastle(context, pts, t, 50);
    context.restore();
}
runCanvas(canvas, draw, 0, true, 0, 1, 0.02);
let slider = /** @type {HTMLInputElement} */ (document.getElementById("canvas1-slider"));

draggablePoints(canvas, pts, function() {
    draw(canvas, Number(slider.value));
});


