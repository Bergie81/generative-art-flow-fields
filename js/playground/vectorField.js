var dim = 400;
var inc = 0.1;
var scl = 20;

var cols, rows;

var zoff = 0;
var fr;

var particles = [];
var noParticles = 600;

var flowField;

function setup() {
  createCanvas(dim, dim);
  cols = floor(width/scl);
  rows = floor(height/scl);
  for (let i = 0; i < noParticles; i++) {
    particles[i] = new Particle();
  }
  flowField = new Array(rows*cols);

  // Paragraph
  fr = createP("");
}

function draw() {
  background(255);
  // randomSeed(10); // stop randomness from animating
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI;
      var v = p5.Vector.fromAngle(angle);
      
      v.setMag(4); // INFO: how strong force (vector) is applied to particles
      flowField[index] = v;
      xoff += inc;

      // // Draw rectangle with noise values
      // fill(r);
      // rect(x * scl, y * scl, scl, scl);
      
      // // Draw vector indicator
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

  stroke(0);
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowField);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
  
  // fr.html(floor(frameRate()));
}
