
let CENTER_X = 0;
let CENTER_Y = 0;

let STROKE_ALIGN_NOISE_POWER = 0.6;
let STROKE_ALIGN_NOISE_SCALE = 0.01;

async function setup() {
  createCanvas(2000, 2400);
  colorMode(HSB);
  pixelDensity(1);

  background(240, 30, 10);

  let colorA = new NYColor(240, 30, 10);
  let colorB = new NYColor(240, 30, 90);
  // await fillBG(colorA, colorB);

  let xCount = 5;
  let yCount = 6;

  let rectW = width / xCount;
  let rectH = height / yCount;

  

  let offsetFrom = 0.1;
  let offsetTo = 0.6;

  let totalIndex = xCount * yCount;

  let strokeLengths = [1, 2, 4, 6, 12, 24];
  let strokeDensityMultipliers = [1.0, 0.6, 0.3, 0.15, 0.06, 0.02];

  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {
      let xt = x / (xCount - 1);
      let yt = y / (yCount - 1);

      let nowIndex = y * xCount + x;
      let indexT = nowIndex / totalIndex;

      push();

      // mask
      beginClip();
      noStroke();
      fill(0, 0, 100);
      rect(rectW * x, rectH * y, rectW, rectH);
      endClip();

      strokeWeight(1);
      let nowMoonX = rectW * x + rectW / 2;
      let nowMoonY = rectH * y + rectH / 2;

      CENTER_X = nowMoonX;
      CENTER_Y = nowMoonY;

      let nowMoonRadius = rectW / 3;

      let angleFrom = 70;
      let angleTo = 80;

      let angleOffsetFrom = -10;
      let angleOffsetTo =  10;

      let nowAngle = lerp(angleFrom, angleTo, yt);
      nowAngle += lerp(angleOffsetFrom, angleOffsetTo, xt);

      // let nowBrushLength = lerp(1, 12, yt);
      // let nowBrushDensityMultiplier = lerp(1.0, 0.001, yt);
      let nowBrushLength = strokeLengths[y];
      let nowBrushDensityMultiplier = strokeDensityMultipliers[y];

      STROKE_ALIGN_NOISE_POWER = lerp(0.0, 0.6, yt);
      STROKE_ALIGN_NOISE_SCALE = lerp(0.001, 0.01, xt);

      await drawMoonLayer(nowMoonX, nowMoonY, nowMoonRadius, colorA, colorB, {
        offsetRatio: lerp(-0.6, 0.6, indexT) + random(-0.2, 0.2),
        offsetAngle: nowAngle,
        brushLength: nowBrushLength,
        brushDensityMultiplier: nowBrushDensityMultiplier
      });

      pop();
    }
  }


  let frameThickness = 10;

  let remainWidth = width - (frameThickness * (xCount + 1));
  let remainHeight = height - (frameThickness * (yCount + 1));

  // draw frames
  for (let x = 0; x <= xCount; x++) {
    let startX = (frameThickness + remainWidth / xCount) * x;

    noStroke();
    fill(0, 0, 6);
    rect(startX, 0, frameThickness, height)
  }

  for (let y = 0; y <= yCount; y++) {
    let startY = (frameThickness + remainHeight / yCount) * y;

    noStroke();
    fill(0, 0, 6);
    rect(0, startY, width, frameThickness)
  }
  console.log("done");


}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}