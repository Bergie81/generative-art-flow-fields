var dim = {x: 400, y: 400};
var inc = 0.1;
var scl = 20;

var cols, rows;

var zoff = 0;
var fr;
var flowField;

let lineWeight = dim.x / (8*scl)

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
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI;
      var v = p5.Vector.fromAngle(angle);
      
      flowField[index] = {vector: v};
      flowField[index].position = {x, y};
      xoff += inc;

      // Draw vector indicator
      stroke(0, 50);
      strokeWeight(1);
      push();
      translate(x * scl, y * scl);
      rotate(v.heading());
      line(0, 0, scl, 0);
      pop();
    }
    yoff += inc;

    // zoff += 0.00005; // INFO: how fast vectors change over time
  }

  for (let i = 0; i < 1; i++) {
    // Get random position in flow field and get vector
    const randomPoint = createVector(random(width), random(height));

    // Apply vector of local field and move along vector
    const flowLine = createFlowLine(randomPoint, 4);
    stylizedLine(flowLine);
    console.log(flowLine);
  }
  
  // fr.html(floor(frameRate()));
}

function drawPoint(p, c) {
  stroke(c)
  strokeWeight(5);
  point(p.x, p.y);
}

function getFlowFieldElement(point) {
  const gridPos = {x: floor(point.x/scl), y: floor(point.y/scl)};
  return flowField.find(element => element.position.x == gridPos.x && element.position.y == gridPos.y);
}

// Make particles enter back scene when leaving
  function edgeBeam(pos) {
    // const newPos = pos.copy();
    if (pos.x > width) {
      pos.x = pos.x - width;
    };
    if (pos.x < 0) {
      pos.x = width + pos.x;
    };
    if (pos.y > height) {
      pos.y = pos.y - height;;
    };
    if (pos.y < 0) {
      pos.y = height + pos.y;
    };
    // return newPos;
  }

// Creates a number of points that follow the flow field
function createFlowLine(startPoint, noPoints) {
  const line = [startPoint];
  for (let i = 0; i < noPoints - 1; i++) {
    const point = line[i].copy();
    // console.log("point", i, point);
    drawPoint(point, floor(255/noPoints) * i);
    const force = getFlowFieldElement(point).vector;
    const normForce = force.mult(scl);
    const nextPoint = point.add(normForce)
    edgeBeam(nextPoint);
    line.push(nextPoint.copy());
    // console.log("point end", i, line[i+1]);
  };
  drawPoint(line[line.length - 1], 200);
  // console.log(line);
  return line;
};

function drawCurvedLine(line, weight, color) {
  strokeWeight(weight);
  stroke(color)
  beginShape();
  for (let i = 0; i < line.length; i++) {
    // console.log("line", i, line[i]);
    curveVertex(line[i].x, line[i].y);
  };
  endShape();
};

function stylizedLine(line) {
  drawCurvedLine(line, lineWeight*2, 0);
  drawCurvedLine(line, lineWeight, 190);
}