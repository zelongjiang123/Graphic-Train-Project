// @ts-check
export {}; // null statement to tell VSCode we're doing a module

// draw the spiral - account for the checkbox and slider

let canvas = document.getElementById("canvas1");
let connection = false;
let bezier = false;
let number_pointsSlider = /** @type {HTMLInputElement} */ (
  document.getElementById("number_points")
);
if (!(canvas instanceof HTMLCanvasElement))
  throw new Error("Canvas is not HTML Element");
function helper(u) {
  return [
    200 + u * 180 * Math.cos(8 * Math.PI * u),
    200 + u * 180 * Math.sin(8 * Math.PI * u),
  ];
}

function helper2(u, number_points) {
  return [
    (180 / number_points) * Math.cos((8 * Math.PI * u) / number_points) -
      ((((180 * u) / number_points) * 8 * Math.PI) / number_points) *
        Math.sin((8 * Math.PI * u) / number_points),
    (180 / number_points) * Math.sin((8 * Math.PI * u) / number_points) +
      ((((180 * u) / number_points) * 8 * Math.PI) / number_points) *
        Math.cos((8 * Math.PI * u) / number_points),
    (180 / number_points) * Math.cos((8 * Math.PI * (u + 1)) / number_points) -
      ((((180 * (u + 1)) / number_points) * 8 * Math.PI) / number_points) *
        Math.sin((8 * Math.PI * (u + 1)) / number_points),
    (180 / number_points) * Math.sin((8 * Math.PI * (u + 1)) / number_points) +
      ((((180 * (u + 1)) / number_points) * 8 * Math.PI) / number_points) *
        Math.cos((8 * Math.PI * (u + 1)) / number_points),
  ];
}

document.getElementById("connection_checkbox").onchange = function () {
  if (this.checked == true) {
    connection = true;
  } else {
    connection = false;
  }
};
document.getElementById("bezier_checkbox").onchange = function () {
  if (this.checked == true) {
    bezier = true;
  } else {
    bezier = false;
  }
};
let context = canvas.getContext("2d");

function draw(timestamp) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.strokeStyle = "black";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(200, 200);
  context.fillRect(200 - 1, 200 - 1, 2, 2);
  let prev_points = [200, 200];
  let number_points = Number(number_pointsSlider.value);
  for (let i = 1; i <= number_points; i++) {
    let pos = helper(i / number_points);
    if (connection) {
      if (bezier) {
        let deri = helper2(i - 1, number_points);
        context.bezierCurveTo(
          prev_points[0] + deri[0] / 3,
          prev_points[1] + deri[1] / 3,
          pos[0] - deri[2] / 3,
          pos[1] - deri[3] / 3,
          pos[0],
          pos[1]
        );
        prev_points[0] = pos[0];
        prev_points[1] = pos[1];
        console.log(deri[0] + " " + deri[1] + " " + deri[2] + " " + deri[3]);
      } else context.lineTo(pos[0], pos[1]);
    }
    context.fillRect(pos[0] - 1, pos[1] - 1, 2, 2);
  }
  context.stroke();
  context.restore();
  window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);
