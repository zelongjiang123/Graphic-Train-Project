/*jshint esversion: 6 */
// you might want to turn this on: // @ts-check

// these two things are the main UI code for the train
// students learned about them in last week's workbook

import { draggablePoints } from "../libs/CS559/dragPoints.js";
import { RunCanvas } from "../libs/CS559/runCanvas.js";

// this is a utility that adds a checkbox to the page
// useful for turning features on and off
import { makeCheckbox } from "../libs/CS559/inputHelpers.js";

/**
 * Have the array of control points for the track be a
 * "global" (to the module) variable
 *
 * Note: the control points are stored as Arrays of 2 numbers, rather than
 * as "objects" with an x,y. Because we require a Cardinal Spline (interpolating)
 * the track is defined by a list of points.
 *
 * things are set up with an initial track
 */
/** @type Array<number[]> */
let thePoints = [
  [150, 150],
  [150, 450],
  [450, 450],
  [450, 150],
];
let arc_length = false;
let simple_track = true;
let beam_length = 20,
  beam_width = 2,
  beam_between = 10;
let train_length = 30,
  train_width = 15;
let rail_width = 5;
let tensionSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("tension")
);
let tension = false;
let car_dis = train_length + 5;
let car_color_array = ["red", "blue", "pink", "purple"];

let bspline = false;

let smoke_objs = [];
let smoke_between = 4,
  smoke_count = 0;
let smoke = false;

/**
 * Draw function - this is the meat of the operation
 *
 * It's the main thing that needs to be changed
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} param
 */
function draw(canvas, param) {
  let context = canvas.getContext("2d");
  // clear the screen
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draw the control points
  thePoints.forEach(function (pt) {
    context.beginPath();
    context.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  });

  draw_track(param);
}

// interpolate Hermite Cubics, p01 is p0', p11 is p1'
function cal_position(p0, p01, p1, p11, u) {
  return [
    p0 +
      p01 * u +
      (-3 * p0 - 2 * p01 + 3 * p1 - p11) * u * u +
      (2 * p0 + p01 - 2 * p1 + p11) * u * u * u,
    p01 +
      (-3 * p0 - 2 * p01 + 3 * p1 - p11) * 2 * u +
      (2 * p0 + p01 - 2 * p1 + p11) * 3 * u * u,
  ];
}

function draw_track(param) {
  let t = 0;
  if (tension) t = Number(tensionSlider.value);
  let s = (1 - t) / 2;
  let u = param % 1,
    index = parseInt(param);

  let total_distance = 0;
  let segs = [];
  let steps = [];

  context.beginPath();
  context.moveTo(thePoints[0][0], thePoints[0][1]);
  let prev_points = [0, 0];
  prev_points[0] = thePoints[0][0];
  prev_points[1] = thePoints[0][1];
  let prev_deri = [0, 0];
  let temp1 = thePoints[thePoints.length - 1],
    temp2 = thePoints[1];
  prev_deri[0] = (temp2[0] - temp1[0]) * s;
  prev_deri[1] = (temp2[1] - temp1[1]) * s;
  let control_array = [];
  for (let i = 1; i <= thePoints.length; i++) {
    let deri = [0, 0];
    deri[0] = (thePoints[(i + 1) % thePoints.length][0] - prev_points[0]) * s;
    deri[1] = (thePoints[(i + 1) % thePoints.length][1] - prev_points[1]) * s;
    let p1 = [
        prev_points[0] + prev_deri[0] / 3,
        prev_points[1] + prev_deri[1] / 3,
      ],
      p2 = [
        thePoints[i % thePoints.length][0] - deri[0] / 3,
        thePoints[i % thePoints.length][1] - deri[1] / 3,
      ],
      p3 = [
        thePoints[i % thePoints.length][0],
        thePoints[i % thePoints.length][1],
      ];

    // memorize the parameters
    let control = [];
    let temp1 = [],
      temp2 = [];
    temp1[0] = prev_points[0];
    temp1[1] = prev_points[1];
    temp2[0] = prev_deri[0];
    temp2[1] = prev_deri[1];
    control.push(temp1);
    control.push(temp2);
    control.push(p3);
    control.push(deri);
    control_array.push(control);

    if (simple_track) {
      let control_points = [
        prev_points,
        p3,
        thePoints[(i + 1) % thePoints.length],
        thePoints[(i + 2) % thePoints.length],
      ];
      //if (bspline) drawbspline(control_points);
      context.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
    }

    let seg_distance = 0;
    let seg_dis = [];
    let previous_x = prev_points[0],
      previous_y = prev_points[1];
    for (let i = 0.1; i <= 1; i += 0.1) {
      let x = cal_position(prev_points[0], prev_deri[0], p3[0], deri[0], i)[0],
        y = cal_position(prev_points[1], prev_deri[1], p3[1], deri[1], i)[0];
      let dis = Math.sqrt(
        (x - previous_x) * (x - previous_x) +
          (y - previous_y) * (y - previous_y)
      );
      total_distance += dis;
      seg_distance += dis;
      seg_dis.push(dis);
      previous_x = x;
      previous_y = y;
    }
    segs.push(seg_distance);
    steps.push(seg_dis);

    prev_deri[0] = deri[0];
    prev_deri[1] = deri[1];
    prev_points[0] = thePoints[i % thePoints.length][0];
    prev_points[1] = thePoints[i % thePoints.length][1];
  }
  context.stroke();

  if (!simple_track) draw_beam(segs, control_array, steps);

  if (arc_length) {
    let u = total_distance * (param / thePoints.length);
    for (let i = 0; i < car_color_array.length; i++) {
      if (i == 0)
        arc_length_para(
          u,
          segs,
          control_array,
          steps,
          car_color_array[i],
          true,
          false
        );
      else if (i == car_color_array.length - 1)
        arc_length_para(
          u,
          segs,
          control_array,
          steps,
          car_color_array[i],
          false,
          true
        );
      else {
        arc_length_para(
          u,
          segs,
          control_array,
          steps,
          car_color_array[i],
          false,
          false
        );
      }
      u -= car_dis;
      if (u < 0) u += total_distance;
    }
  } else {
    let parameters = control_array[index];
    let x = cal_position(
        parameters[0][0],
        parameters[1][0],
        parameters[2][0],
        parameters[3][0],
        u
      ),
      y = cal_position(
        parameters[0][1],
        parameters[1][1],
        parameters[2][1],
        parameters[3][1],
        u
      );
    let dis = Math.sqrt(x[1] * x[1] + y[1] * y[1]);
    draw_train(x[0], y[0], x[1] / dis, y[1] / dis, "red", true);
    if (smoke_count == 1 && smoke) smoke_objs.push([x[0], y[0], 0, 14]);
  }
  if (smoke) draw_smoke();
  smoke_count = (smoke_count + 1) % smoke_between;
  let tree_pos = average_pos();
  draw_tree(tree_pos[0], tree_pos[1]);
}

function average_pos() {
  let x = 0,
    y = 0;
  for (let i = 0; i < thePoints.length; i++) {
    x += thePoints[i][0];
    y += thePoints[i][1];
  }
  x /= thePoints.length;
  y /= thePoints.length;
  return [x, y];
}

function drawbspline(control_points) {
  context.save();
  context.beginPath();
  let param = bspline_helper(0);
  let x = 0,
    y = 0;
  for (let i = 0; i < 4; i++) {
    x += param[i] * control_points[i][0];
    y += param[i] * control_points[i][1];
  }

  context.moveTo(x, y);
  for (let i = 0; i < 1.05; i += 0.05) {
    param = bspline_helper(i);
    x = 0;
    y = 0;
    for (let j = 0; j < 4; j++) {
      x += param[j] * control_points[j][0];
      y += param[j] * control_points[j][1];
    }
    context.lineTo(x, y);
  }
  context.stroke();
  context.restore();
}
function bspline_helper(t) {
  return [
    (-1 / 6) * t * t * t + (1 / 2) * t * t - (1 / 2) * t + 1 / 6,
    (1 / 2) * t * t * t - t * t + 2 / 3,
    (-1 / 2) * t * t * t + (1 / 2) * t * t + (1 / 2) * t + 1 / 6,
    (1 / 6) * t * t * t,
  ];
}

function draw_tree(x, y) {
  let start_x = 30,
    start_y = -10;
  context.save();
  context.translate(x, y);
  context.fillStyle = "brown";
  context.fillRect(-5, -10, 10, 20);
  context.beginPath();
  context.fillStyle = "green";
  for (let i = 0; i < 5; i++) {
    context.moveTo(-start_x, start_y);
    context.lineTo(start_x, start_y);
    start_y -= 10;
    context.lineTo(0, start_y);
    context.fill();
    start_x -= 5;
    start_y += 5;
  }
  context.restore();
}

function draw_smoke() {
  for (let i = 0; i < smoke_objs.length; i++) {
    let smoke = smoke_objs[i];
    if (smoke[2] > 0) {
      context.save();
      context.beginPath();
      context.fillStyle = "	rgb(211,211,211, 0.7)";
      context.arc(smoke[0], smoke[1], smoke[2], 0, 2 * Math.PI);
      context.fill();
      context.restore();
      if (smoke_count == 1) smoke[3] -= 1;
    }
    if (smoke[2] <= 12 && smoke_count == 1) smoke[2] += 1;
  }
  smoke_objs = smoke_objs.filter((smoke) => smoke[3] > 0);
}

function draw_beam(segs, control_array, steps) {
  let previous = [0, 0, 0, 0];
  let first = [0, 0, 0, 0];
  let u = 0;
  let count = 0;
  for (let i = 0; i < thePoints.length; i++) {
    if (segs[i] >= u) {
      let parameters = control_array[i];
      for (let j = 0; j < steps[i].length; j++) {
        while (steps[i][j] >= u) {
          let position = (u / steps[i][j]) * 0.1 + 0.1 * j;
          let x = cal_position(
              parameters[0][0],
              parameters[1][0],
              parameters[2][0],
              parameters[3][0],
              position
            ),
            y = cal_position(
              parameters[0][1],
              parameters[1][1],
              parameters[2][1],
              parameters[3][1],
              position
            );
          let dis = Math.sqrt(x[1] * x[1] + y[1] * y[1]);
          draw_beam_helper(x[0], y[0], x[1] / dis, y[1] / dis);
          u += beam_between;

          if (count == 0) {
            first[0] = x[0];
            first[1] = y[0];
            first[2] = x[1] / dis;
            first[3] = y[1] / dis;
          }

          if (count > 0) {
            draw_parallel_track(
              previous[0],
              previous[1],
              previous[2],
              previous[3],
              x[0],
              y[0],
              x[1] / dis,
              y[1] / dis
            );
          }
          previous[0] = x[0];
          previous[1] = y[0];
          previous[2] = x[1] / dis;
          previous[3] = y[1] / dis;
          count += 1;
        }
        u -= steps[i][j];
      }
    } else u -= segs[i];
  }
  draw_parallel_track(
    previous[0],
    previous[1],
    previous[2],
    previous[3],
    first[0],
    first[1],
    first[2],
    first[3]
  );
}

function draw_parallel_track(
  prev_x,
  prev_y,
  prev_dirx,
  prev_diry,
  x,
  y,
  dirx,
  diry
) {
  // draw outer track
  context.beginPath();
  context.save();
  context.transform(
    prev_diry,
    -prev_dirx,
    prev_dirx,
    prev_diry,
    prev_x,
    prev_y
  );
  context.moveTo(-rail_width, 0);
  context.restore();
  context.save();
  context.transform(diry, -dirx, dirx, diry, x, y);
  context.lineTo(-rail_width, 0);
  context.stroke();
  context.restore();

  // draw innter track
  context.beginPath();
  context.save();
  context.transform(
    prev_diry,
    -prev_dirx,
    prev_dirx,
    prev_diry,
    prev_x,
    prev_y
  );
  context.moveTo(rail_width, 0);
  context.restore();
  context.save();
  context.transform(diry, -dirx, dirx, diry, x, y);
  context.lineTo(rail_width, 0);
  context.stroke();
  context.restore();
}

function draw_beam_helper(x, y, dirx, diry) {
  context.save();
  context.transform(diry, -dirx, dirx, diry, x, y);
  context.fillStyle = "green";
  context.fillRect(-beam_length / 2, 0, beam_length, beam_width);
  context.restore();
}

function arc_length_para(u, segs, control_array, steps, color, first, last) {
  for (let i = 0; i < thePoints.length; i++) {
    if (segs[i] >= u) {
      let parameters = control_array[i];
      for (let j = 0; j < steps[i].length; j++) {
        if (steps[i][j] >= u) {
          let position = (u / steps[i][j]) * 0.1 + 0.1 * j;
          let x = cal_position(
              parameters[0][0],
              parameters[1][0],
              parameters[2][0],
              parameters[3][0],
              position
            ),
            y = cal_position(
              parameters[0][1],
              parameters[1][1],
              parameters[2][1],
              parameters[3][1],
              position
            );
          if (last && smoke_count == 1 && smoke)
            smoke_objs.push([x[0], y[0], 0, 14]);
          let dis = Math.sqrt(x[1] * x[1] + y[1] * y[1]);
          draw_train(x[0], y[0], x[1] / dis, y[1] / dis, color, first);
          break;
        }
        u -= steps[i][j];
      }
      break;
    }
    u -= segs[i];
  }
}

/*
let prev_x = 0, prev_y = 0;*/
function draw_train(x, y, dirx, diry, color, first) {
  context.save();
  context.fillStyle = color;
  context.transform(dirx, diry, -diry, dirx, x, y);
  context.fillRect(
    -train_length / 2,
    -train_width / 2,
    train_length,
    train_width
  );
  if (first) {
    // draw a triangle to indicate the front
    context.beginPath();
    context.moveTo(train_length / 2, 0);
    context.lineTo(train_length * 2, (train_width * 3) / 4);
    context.lineTo(train_length * 2, (-train_width * 3) / 4);
    context.fillStyle = "rgb(255,255,0,0.5)";
    context.closePath();
    context.fill();
  }
  if (arc_length) {
    draw_wheels(train_length / 2 - 5, rail_width);
    draw_wheels(-train_length / 2 + 5, rail_width);
  }
  /*
  let dis = Math.sqrt(
    (prev_x - x) * (prev_x - x) + (prev_y - y) * (prev_y - y)
  );
  console.log(dis);
  prev_x = x;
  prev_y = y;*/
  //console.log(x + " " + y + " " + dirx + " " + diry);
  context.restore();
}
function draw_wheels(x, y) {
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, -y);
  context.stroke();
  context.beginPath();
  context.moveTo(x - 2, y);
  context.lineTo(x + 2, y);
  context.stroke();
  context.beginPath();
  context.moveTo(x - 2, -y);
  context.lineTo(x + 2, -y);
  context.stroke();
}

/**
 * Initialization code - sets up the UI and start the train
 */
let canvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("canvas1")
);
let context = canvas.getContext("2d");

// we need the slider for the draw function, but we need the draw function
// to create the slider - so create a variable and we'll change it later
let slider; // = undefined;

// note: we wrap the draw call so we can pass the right arguments
function wrapDraw() {
  // do modular arithmetic since the end of the track should be the beginning
  draw(canvas, Number(slider.value) % thePoints.length);
}
// create a UI
let runcanvas = new RunCanvas(canvas, wrapDraw);
// now we can connect the draw function correctly
slider = runcanvas.range;

// note: if you add these features, uncomment the lines for the checkboxes
// in your code, you can test if the checkbox is checked by something like:
// document.getElementById("check-simple-track").checked
// in your drawing code
// WARNING: makeCheckbox adds a "check-" to the id of the checkboxes
//
// lines to uncomment to make checkboxes
makeCheckbox("simple-track").checked = true;
makeCheckbox("arc-length").checked = false;
//makeCheckbox("bspline").checked = false;
makeCheckbox("smoke").checked = false;

// helper function - set the slider to have max = # of control points
function setNumPoints() {
  runcanvas.setupSlider(0, thePoints.length, 0.05);
}

document.getElementById("check-arc-length").onchange = function () {
  if (this.checked == true) {
    arc_length = true;
  } else arc_length = false;
  draw(canvas, Number(slider.value) % thePoints.length);
};

document.getElementById("check-smoke").onchange = function () {
  if (this.checked == true) {
    smoke = true;
  } else smoke = false;
  draw(canvas, Number(slider.value) % thePoints.length);
};

document.getElementById("check-simple-track").onchange = function () {
  if (this.checked == true) {
    simple_track = true;
  } else simple_track = false;
  draw(canvas, Number(slider.value) % thePoints.length);
};

document.getElementById("tension_checkbox").onchange = function () {
  if (this.checked == true) {
    tension = true;
  } else tension = false;
  draw(canvas, Number(slider.value) % thePoints.length);
};

/*
document.getElementById("check-bspline").onchange = function () {
  if (this.checked == true) {
    bspline = true;
  } else bspline = false;
  draw(canvas, Number(slider.value) % thePoints.length);
};*/

setNumPoints();
runcanvas.setValue(0);

// add the point dragging UI
draggablePoints(canvas, thePoints, wrapDraw, 10, setNumPoints);
