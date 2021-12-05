let cols, rows;
let flowField;
let frameRateCheck;
let zoff = 0;

// Canvas
let dim = {x: 1000, y: 1000};
let sceneScale = 25;
let inc = 0.1;

// Strokes
const noStrokes = 50;
const noStrokeLines = 6;
const strokeLineDistance = 1.9;
const strokeLineNoise = 0.3;
const lineNoise = 0.9;

let lineWeight = dim.x / (18*sceneScale);

// Spots
const spotArea = 2;
const noSpotStrokes = 100;
const spotNoise = 5;

// Colors
const outlineColor = "#000";

const colorPalette1 = ["#2B3A42", "#3F5866", "#BDD3DE", "#F0F0DF", "#FF9000"]; // Kuler: machine - Kopie von Copy of MAchine learning with Erik option 2
const colorPalette2 = ["#181929", "#4D4E66", "#CCD0DE", "#FFFFFF", "#FF2612"]; // Kuler: machine - Kopie von Copy of MAchine learning with Erik option 2
const colorPalette3 = ["#609BE6", "#65C6F0", "#66D5D9", "#65F0CD", "#60E69F"]; // Kuler - colorful
const colorPalette = colorPalette2;

function setup() {
  createCanvas(dim.x, dim.y);
  cols = floor(width/sceneScale);
  rows = floor(height/sceneScale);
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
      showVectorField(x, y, v);
    };
    yoff += inc;
    // zoff += 0.00005; // INFO: how fast vectors change over time
  };

  // Draw blob of strokes
  drawBlobsOfStrokes(5, colorPalette);

  // Draw random single strokes
  const noStrokeTypes = 5
  for (let i = 0; i < noStrokeTypes; i++) {
    drawSingleStrokes(colorPalette[i]);
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
      translate(x * sceneScale, y * sceneScale);
      rotate(v.heading());
      line(0, 0, sceneScale, 0);
      pop();
};

function randomNoise(factor) {
  return map(noise(random()), 0, 1, 1 - factor, 1 + factor);
};

function getFlowFieldElement(point) {
  const gridPos = {x: floor(point.x/sceneScale), y: floor(point.y/sceneScale)};
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
    const force = direction.setMag(sceneScale);
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
    const force = direction.copy().setMag(no * strokeLineDistance * randomNoise(strokeLineNoise)).rotate(-PI/2  * randomNoise(lineNoise));
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
  drawCurvedStroke(line, lineWeight * 2.5, outlineColor);
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
    const spotRadius = spotArea * sceneScale * randomNoise(spotNoise);
    
    // console.log("random Spot", randomSpot.x, randomSpot.y);
    let counter = 0;
    let loopChecker = 0;
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
        loopChecker++
        console.warn("Cannot create stroke:", spotPoint.x, spotPoint.y);
      };
      // Get out of loop if there are issues
      if (loopChecker > 10000) {
        counter = noSpotStrokes
        console.error("LOOP EXIT - Strokes too close to canvas border.");
      };
    };
    // console.log("NO of Elements", counter, noSpotStrokes);
    // if (spots.length > 0) {
      for (let j = 0; j < spots.length; j++) {
        drawCurvedStroke(spots[j], lineWeight * 2.5, outlineColor);
      };
      for (let k = 0; k < spots.length; k++) {
        drawCurvedStroke(spots[k], lineWeight, color[i]);
      };
      // drawPoint(randomSpot, 0);
    // };
  };
};