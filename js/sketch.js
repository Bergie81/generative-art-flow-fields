let dim = {x: 800, y: 800};
let inc = 0.1;
let scl = 20;

const noStrokeLines = 6;
const noStrokes = 400;

let cols, rows;
let zoff = 0;
let flowField;
let fr;

let lineWeight = dim.x / (17*scl);

function setup() {
  createCanvas(dim.x, dim.y);

  cols = floor(width/scl);
  rows = floor(height/scl);
  flowField = new Array(rows*cols);

  noFill();
  noLoop();

  // Paragraph
  fr = createP("");
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
    }
    yoff += inc;
    // zoff += 0.00005; // INFO: how fast vectors change over time
  }

  // Draw stylized strokes
  drawStrokeGroup(80);
  drawStrokeGroup(160);
  drawStrokeGroup(240);
  
  // fr.html(floor(frameRate()));
}

function showVectorField(x, y, v) {
  // Draw vector indicator
      stroke(0, 50);
      strokeWeight(1);
      push();
      translate(x * scl, y * scl);
      rotate(v.heading());
      line(0, 0, scl, 0);
      pop();
}

function drawPoint(p, c) {
  stroke(c, 0)
  strokeWeight(3);
  point(p.x, p.y);
}

function getFlowFieldElement(point) {
  const gridPos = {x: floor(point.x/scl), y: floor(point.y/scl)};
  return flowField.find(element => element.position.x == gridPos.x && element.position.y == gridPos.y) || undefined;
}

// // Make particles enter back scene when leaving //edgeBeam(nextPoint);
// function edgeBeam(pos) {
//   if (pos.x > width) {
//     pos.x = pos.x - width;
//   };
//   if (pos.x < 0) {
//     pos.x = width + pos.x;
//   };
//   if (pos.y > height) {
//     pos.y = pos.y - height;;
//   };
//   if (pos.y < 0) {
//     pos.y = height + pos.y;
//   };
// }

// Creates a number of points that follow the flow field
function createFlowLine(startPoint, noPoints) {
  const line = [startPoint];
  for (let i = 0; i < noPoints - 1; i++) {
    const point = line[i].copy();
    // console.log("point", i, point);
    drawPoint(point, floor(255/noPoints) * i);
    const force = getFlowFieldElement(point).vector;
    const normForce = force.normalize().mult(scl);
    const nextPoint = point.add(normForce);

    // Prevents long strokes
    if (nextPoint.x < 0 || nextPoint.x > dim.x || nextPoint.y < 0 || nextPoint.y > dim.y) {
      break;
    }

    // Not working ...
    // const distance = {};
    // distance.x = Math.abs(nextPoint.x - point.x);
    // distance.y = Math.abs(nextPoint.y - point.y);
    // if (distance.x > dim.x/4 || distance.y > dim.y/4) {
    //   console.log("LONG_________", distance );
    //   break;
    // }

    line.push(nextPoint.copy());
  };
  drawPoint(line[line.length - 1], 200);
  // console.log("line length", line.length);
  if (line.length !== noPoints) {
    return null
  } else {
    return line;
  }
};
// Creates a number of points that follow the flow field
function createAdjacentFlowLine(line, no) {
  const adjLine = [];
  for (let i = 0; i < line.length; i++) {
    const lineDistance = 2;
    let point = line[i].copy();
    const force = getFlowFieldElement(point).vector;
    const adjForce = force.copy().setMag(lineDistance * no).rotate(-PI/2);
    point = point.add(adjForce);
    drawPoint(point, i * 30);
    adjLine.push(point);
  };
  // console.log(adjLine);
  return adjLine;
};

function drawCurvedStroke(lines, weight, color) {
  // console.log("Random line:", line);
  strokeWeight(weight);
  stroke(color)
  
  for (let i = 0; i < lines.length; i++) {
    beginShape();
    for (let ii = 0; ii < lines[i].length; ii++) {
      const line = lines[i];
      curveVertex(line[ii].x, line[ii].y);
    }
    endShape();
  };
};

// function drawCurvedLine(line, weight, color) {
//   strokeWeight(weight);
//   stroke(color)
//   beginShape();
//   for (let i = 0; i < line.length; i++) {
//     // console.log("line", i, line[i]);
//     curveVertex(line[i].x, line[i].y);
//   };
//   endShape();
// };

function stylizedStroke(line, color) {
  drawCurvedStroke(line, lineWeight*2.5, 0);
  drawCurvedStroke(line, lineWeight, color);
}

function drawStrokeGroup(color) {
  let counter = 0;
  let counter2 = 0; 
  while (counter < noStrokes) {
    // console.log("counter", counter);
    // Get random position in flow field and get vector
    const randomPoint = createVector(random(width), random(height));
    // Draw base line starting from random position
    const baseLine = createFlowLine(randomPoint, 4);
    // console.log("Line length", baseLine);
    // Draw more lines base on base line to create stroke
    if (baseLine) {
      // console.log("stroke OK", counter2);
      const stroke = [baseLine];
      for (let i = 1; i < noStrokeLines; i++) {
        const adjLines = createAdjacentFlowLine(baseLine, i);
        stroke.push(adjLines);
      };
      // console.log("Stroke", stroke);
      stylizedStroke(stroke, color);
      counter++
    }
    counter2++
    if (counter2 > 1500) {
        counter = 10000000;
      };
  };
}