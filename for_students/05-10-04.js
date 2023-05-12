// @ts-check
/* jshint -W069, -W141, esversion:6 */
export {};  // null statement to tell VSCode we're doing a module

// note that checking that canvas is the right type of element tells typescript
// that this is the right type - it's a form of a safe cast 
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let context = canvas.getContext("2d");

// the parabola - we scale by 100 to get the right size
function parabola(u) {
    return [100*u,100*u*u];
}

context.lineWidth=3;
context.strokeStyle = "black";

// make the coordinate system go bottom to top
context.translate(0,canvas.height);
context.scale(1,-1);

// make a margin
context.translate(50,50);
// we don't scale since that messes up line width

context.beginPath();
context.moveTo(0,0);
// draw the parabola
for(let u=0; u<=1.0; u+=0.1) {
    const p = parabola(u);
    context.lineTo( p[0], p[1] );
}
context.stroke();

//
// version 2 - draw each piece different colors
context.translate(100,0);
// we need to draw as independent lines so we can change color
for(let i=0; i<10; i++) {
    const p1 = parabola(i*0.1);
    const p2 = parabola((i+1)*0.1);
    context.strokeStyle = (i%2) ? "black" : "red";
    context.beginPath();
    context.moveTo(p1[0],p1[1]);
    context.lineTo(p2[0],p2[1]);
    context.stroke();
}
