// Stroke
let strokeSteps = 16;
let strokeDistance = 1;
let strokeLength = 40;
let strokeX = 200;
let strokeY = 200;

let increment = 5; //variance


// functions
function createSingleStroke(index, line) {
  let noiseX1 = noise(index) * increment;
  let noiseX2 = noise(index + 0.1) * increment;

  let posY = strokeY + index * strokeDistance;

  // beginShape();
  //   curveVertex(0, 0);
  //   curveVertex((strokeX - strokeLength) - noiseX1, posY - noiseX1);
  //   curveVertex((strokeX + strokeLength) + noiseX2, posY + noiseX2);
  //   curveVertex(400, 400);
  // endShape();


  // Draw curved line
  beginShape();
  for (let i = 0; i < line.length; i++) {
    // console.log("line", i, line[i]);
    curveVertex(line[i].x, line[i].y + index * strokeDistance);
  };
  endShape();
};

function createStrokes(noLines = 5, weight = 1, color = 0, line) {
  strokeWeight(weight);
  stroke(color)

  for (let i = 0; i < noLines/2; i++) {
    createSingleStroke(i, line)
    // avoid drawing 2 lines on top of each other for i=0 and i=1
    if (i > 0) {
      createSingleStroke(i*-1, line);
    };
  };
};

function paintStroke(line) {
  // Multiply Lines centered
  createStrokes(strokeSteps, 4, 0, line);
  createStrokes(strokeSteps, 2, 190, line);
}
