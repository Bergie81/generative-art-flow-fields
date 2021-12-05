let cols, rows;
let flowField;
let frameRateCheck;
let zoff = 0;

// Canvas
let dim = {x: 1000, y: 1000};
let scl = 25;
let inc = 0.1;

// Strokes
const noStrokes = 300;
const noStrokeLines = 6;
const strokeLineDistance = 1.8;

let lineWeight = dim.x / (18*scl);


function setup() {
  createCanvas(dim.x, dim.y);
  cols = floor(width/scl);
  rows = floor(height/scl);
  flowField = new Array(rows*cols);
  noFill();
  noLoop();
  frameRateCheck = createP(""); // Paragraph
}

function draw() {
  background(255);
  // Create flow field
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, zoff) * TWO_PI;
      let v = p5.Vector.fromAngle(angle);
      flowField[index] = {vector: v};
      flowField[index].position = {x, y};
      xoff += inc;
      // showVectorField(x, y, v);
    };
    yoff += inc;
    // zoff += 0.00005; // INFO: how fast vectors change over time
  }

  // Draw stylized strokes
  drawSingleStrokes(80);
  drawSingleStrokes(160);
  drawSingleStrokes(240);
  
  // frameRateCheck.html(floor(frameRate()));
}

// --------------------------------------------------
// Functions
// --------------------------------------------------

function drawPoint(p, c) {
  stroke(c)
  strokeWeight(3);
  point(p.x, p.y);
};

function showVectorField(x, y, v) {
  // Draw vector indicator
      stroke(0, 50);
      strokeWeight(1);
      push();
      translate(x * scl, y * scl);
      rotate(v.heading());
      line(0, 0, scl, 0);
      pop();
};

function getFlowFieldElement(point) {
  const gridPos = {x: floor(point.x/scl), y: floor(point.y/scl)};
  return flowField.find(element => element.position.x == gridPos.x && element.position.y == gridPos.y);
};

// Creates a number of points that follow the flow field
function createFlowLine(startPoint, noPoints) {
  const line = [startPoint];
  for (let i = 0; i < noPoints - 1; i++) {
    const point = line[i].copy();
    // console.log("point", i, point);
    // drawPoint(point, floor(255/noPoints) * i);
    const direction = getFlowFieldElement(point).vector;
    const force = direction.setMag(scl);
    const nextPoint = point.add(force);
    // Prevents long strokes due to points leaving the canvas
    if (nextPoint.x < 0 || nextPoint.x > dim.x || nextPoint.y < 0 || nextPoint.y > dim.y) {
      break;
    };
    line.push(nextPoint.copy());
  };
  // drawPoint(line[line.length - 1], 200);
  // console.log("line length", line.length);
  if (line.length !== noPoints) {
    return null;
  } else {
    return line;
  };
};

// Creates a number of points that follow the flow field
function createAdjacentFlowLine(line, no) {
  const adjacentLine = [];
  for (let i = 0; i < line.length; i++) {
    let point = line[i].copy();
    const direction = getFlowFieldElement(point).vector;
    const force = direction.copy().setMag(strokeLineDistance * no).rotate(-PI/2);
    point = point.add(force);
    // drawPoint(point, i * 30);
    adjacentLine.push(point);
  };
  // console.log(adjacentLine);
  return adjacentLine;
};

function drawCurvedStroke(lines, weight, color) {
  strokeWeight(weight);
  stroke(color);
  for (let i = 0; i < lines.length; i++) {
    beginShape();
    for (let ii = 0; ii < lines[i].length; ii++) {
      const line = lines[i];
      curveVertex(line[ii].x, line[ii].y);
    };
    endShape();
  };
};

function stylizedStroke(line, color) {
  drawCurvedStroke(line, lineWeight * 2.5, 0);
  drawCurvedStroke(line, lineWeight, color);
};

function drawSingleStrokes(color) {
  let counter = 0;
  while (counter < noStrokes) {
    // console.log("counter", counter);
    // Get random position in flow field and get vector
    const randomPoint = createVector(random(width), random(height));
    // Draw base line starting from random position
    const baseLine = createFlowLine(randomPoint, 4);
    // console.log("Line length", baseLine);
    // Draw more lines base on base line to create stroke (if not null)
    if (baseLine) {
      const stroke = [baseLine];
      for (let i = 1; i < noStrokeLines; i++) {
        const adjacentLines = createAdjacentFlowLine(baseLine, i);
        stroke.push(adjacentLines);
      };
      // console.log("Stroke", stroke);
      stylizedStroke(stroke, color);
      counter++;
    };
  };
};