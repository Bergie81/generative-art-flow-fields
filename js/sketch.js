let cols, rows;
let flowField;
let frameRateCheck;
let zoff = 0;

// Canvas
let dim = {x: 1000, y: 1000};
let scl = 25;
let inc = 0.1;

// Strokes
const noStrokes = 30;
const noStrokeLines = 6;
const strokeLineDistance = 1.8;

let lineWeight = dim.x / (18*scl);

// Spots
const spotArea = 3;
const noSpotStrokes = 100;


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
  };

  // Draw blob of strokes
  drawBlobsOfStrokes(3, [60, 140, 220]);

  // Draw random single strokes
  const noStrokeTypes = 3
  for (let i = 0; i < noStrokeTypes; i++) {
    drawSingleStrokes(floor(250 * i / noStrokeTypes));
  };

  
  // frameRateCheck.html(floor(frameRate()));
}

// --------------------------------------------------
// Functions
// --------------------------------------------------

function drawPoint(p, c) {
  stroke(c)
  strokeWeight(10);
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
    const randomPoint = createVector(random(width), random(height));
    // Draw base line with 4 points starting from random position
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

// Blob of same stroke
function drawBlobsOfStrokes(noSpots, color) {
  
  // Spots
  for (let i = 0; i < noSpots; i++) {
    const spots = [];
    const randomSpot = createVector(random(width), random(height));
    const spotAreaVariation = map(noise(random()), 0, 1, 0.8, 1.2);
    const spotRadius = spotArea * scl * spotAreaVariation;
    
    // console.log("random Spot", randomSpot.x, randomSpot.y);
    let counter = 0;
    let loopbreaker = 0;
    while (counter < noSpotStrokes) {
      const spotPoint = createVector((randomSpot.x - spotRadius) + (2 * spotRadius * noise(random() * counter)), ((randomSpot.y - spotRadius) + (2 * spotRadius * noise(random() * counter))));
      
      // Avoid issues with line tracking in flow field
      if (spotPoint.x < 0) {
        spotPoint.x = 10;
      };
      if (spotPoint.x > width) {
        spotPoint.x = width - 10;
      };
      if (spotPoint.y < 0) {
        spotPoint.y = 10 ;
      };
      if (spotPoint.y > height) {
        spotPoint.y = height - 10;
      };

      // drawPoint(spotPoint, 200);
      // console.log("Spot Point", spotPoint.x, spotPoint.y);
      // Draw base line with 4 points starting from spotPoint handle position
      const baseLine = createFlowLine(spotPoint, 4);
      // console.log("Line length", baseLine);
      // Draw more lines base on base line to create stroke (if not null)
      if (baseLine) {
        const stroke = [baseLine];
        for (let i = 1; i < noStrokeLines; i++) {
          const adjacentLines = createAdjacentFlowLine(baseLine, i);
          stroke.push(adjacentLines);
        };
        // console.log("Stroke", stroke);
        counter++;
        spots.push(stroke);
      } else {
        loopbreaker++
        console.warn("Cannot create stroke:", spotPoint.x, spotPoint.y);
      };
      // Get out of loop if there are issues
      if (loopbreaker > 10000) {
        counter = noSpotStrokes
        console.error("LOOP EXIT - Strokes too close to canvas border.");
      };
    };
    // console.log("NO of Elements", counter, noSpotStrokes);
    // if (spots.length > 0) {
      for (let j = 0; j < spots.length; j++) {
        drawCurvedStroke(spots[j], lineWeight * 2.5, 0);
      };
      for (let k = 0; k < spots.length; k++) {
        drawCurvedStroke(spots[k], lineWeight, color[i]);
      };
      drawPoint(randomSpot, 0);
    // };
  };
};