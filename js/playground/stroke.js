let dim = 400;

// Stroke
let strokeSteps = 16;
let strokeDistance = 1;
let strokeLength = 40;
let strokeX = 200;
let strokeY = 200;

let inc = 5; //variance

let fr;

function setup() {
  // background(15);
  createCanvas(dim, dim);
}

function draw() {
  background(255);
  noFill();


  // // Curved Line
  // beginShape();
  // curveVertex(mouseX, mouseY);
  // curveVertex(100, 200);
  // curveVertex(300, 200);
  // curveVertex(300, 400);
  // endShape();

  paintStroke();

  // fr.html(floor(frameRate()));
}

// functions
function createSingleStroke(index) {
  let noiseX1 = noise(index) * inc;
  let noiseX2 = noise(index + 0.1) * inc;

  let posY = strokeY + index * strokeDistance;

  beginShape();
    curveVertex(mouseX, mouseY);
    curveVertex((strokeX - strokeLength) - noiseX1, posY - noiseX1);
    curveVertex((strokeX + strokeLength) + noiseX2, posY + noiseX2);
    curveVertex(400, 400);
  endShape();
};

function createStrokes(noLines = 5, weight = 1, color = 0) {
  strokeWeight(weight);
  stroke(color)

  for (let i = 0; i < noLines/2; i++) {
    createSingleStroke(i)
    // avoid drawing 2 lines on top of each other for i=0 and i=1
    if (i > 0) {
      createSingleStroke(i*-1);
    };
  };
};

function paintStroke() {
  // Multiply Lines centered
  createStrokes(strokeSteps, 4);
  createStrokes(strokeSteps, 2, 190);
}
