var dim = 400;
var inc = 0.1;
var scl = 10;

var cols, rows;

var zoff = 0;
var fr;

var particles = [];
var noParticles = 600;

var flowField;

function setup() {
  background(255);
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
    }
    yoff += inc;

    zoff += 0.00005; // INFO: how fast vectors change over time
  }

stroke(0, 0.8);
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowField);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
  
  // fr.html(floor(frameRate()));
}
