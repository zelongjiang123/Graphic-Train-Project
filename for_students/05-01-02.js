// @ts-check

import { runCanvas } from "../libs/CS559/runCanvas.js";
import { functionGallery } from "./05-01-curves.js";

// note that checking that canvas is the right type of element tells typescript
// that this is the right type - it's a form of a safe cast 
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let context = canvas.getContext("2d");

function draw1(canvas, t) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(20, 80);
    functionGallery(context, t, 0.4);
    context.restore();
}
runCanvas(canvas, draw1, 0, true, 0, 1, 0.02);

