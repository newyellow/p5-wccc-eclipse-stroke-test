async function drawMoonLayer(_x, _y, _size, _colorA, _colorB, _options = {}) {

    let o = {
        offsetRatio: random(0.1, 0.4),
        offsetAngle: random(0, 360),

        brushLength: 1.0,
        brushDensityMultiplier: 1,
    }

    optionOverride(o, _options);

    let moonX = _x;
    let moonY = _y;

    let moonSize = _size;

    let eclipseOffset = o.offsetRatio * moonSize;
    let eclipseAngle = o.offsetAngle;

    let eclipseX = moonX + sin(radians(eclipseAngle)) * eclipseOffset;
    let eclipseY = moonY + cos(radians(eclipseAngle)) * eclipseOffset;

    blendMode(ADD);
    stroke(_colorB.h, _colorB.s, _colorB.b, 0.2);
    await drawMoon(moonX, moonY, moonSize * 1.4, {
        brushLength: o.brushLength,
        brushDensityMultiplier: o.brushDensityMultiplier
    });

    stroke(_colorB.h, _colorB.s, _colorB.b, 0.1);
    await drawMoon(moonX, moonY, moonSize * 1.2, {
        brushLength: o.brushLength,
        brushDensityMultiplier: o.brushDensityMultiplier
    });

    stroke(0, 0, 100, 0.3);
    await drawMoon(moonX, moonY, moonSize * 1.2, {
        brushLength: o.brushLength,
        brushDensityMultiplier: o.brushDensityMultiplier
    });

    stroke(0, 0, 100, 1.0);
    await drawMoonContour(moonX, moonY, moonSize, {
        brushSize: 2,
        strokeDensity: 0.2,
        brushDensity: 0.3,
        brushLength: o.brushLength,
        brushDensityMultiplier: o.brushDensityMultiplier
    });

    // eclipse
    blendMode(BLEND);
    stroke(_colorA.h, _colorA.s, _colorA.b, 0.6);
    await drawMoon(eclipseX, eclipseY, moonSize * 0.95, {
        strokeDensity: 0.24,
        brushSizeFrom: 10,
        brushSizeTo: 6,
        brushDensityFrom: 0.2,
        brushDensityTo: 0.1,
        noisePowerTo: 0.0,

        brushLength: o.brushLength,
        brushDensityMultiplier: o.brushDensityMultiplier
    });

    stroke(_colorA.h, _colorA.s, _colorA.b, 0.8);
    await drawMoonContour(eclipseX, eclipseY, moonSize, {
        brushSize: 2,
        strokeDensity: 0.6,
        brushDensity: 0.3,

        brushLength: o.brushLength,
        brushDensityMultiplier: o.brushDensityMultiplier
    });
    noStroke();
}


async function drawTree(_x, _y, _length, _startDir) {

    // let tree grow
    let options = {
        'startAngle': _startDir,
        'fromWidth': random(6, 20),
        'toWidth': random(1, 3),
        // 'noiseZSeed': 666
    };
    let treeNode = new TreeNode(_x, _y, _length, options);

    let counter = 0;
    while (treeNode.isFinished == false) {
        treeNode.step();
        treeNode.draw();

        if (counter++ % 100 == 0)
            await sleep(1);
    }
}

async function drawMoonContour(_x, _y, _radius, _options = {}) {
    let o = {
        brushSize: 10,
        strokeDensity: 0.1,
        brushDensity: 0.1,
        brushLength: 1.0,
        brushDensityMultiplier: 1.0
    };

    optionOverride(o, _options);

    let strokeDensity = o.strokeDensity;
    let strokeCount = _radius * 2 * PI * strokeDensity;

    for (let s = 0; s < strokeCount; s++) {
        let circleT = s / strokeCount;
        let nowAngle = circleT * TWO_PI;

        let xPos = _x + sin(nowAngle) * _radius * 0.5;
        let yPos = _y + -cos(nowAngle) * _radius * 0.5;

        strokeBrush(xPos, yPos, o.brushSize, o.brushLength, o.brushDensity * o.brushDensityMultiplier);
    }

}

async function drawMoon(_x, _y, _radius, _options = {}) {
    let o = {
        strokeDensity: 0.1,

        brushLength: 1,
        brushDensityFrom: 0.1,
        brushDensityTo: 0.001,

        brushSizeFrom: 30,
        brushSizeTo: 30,

        brushAlphaFrom: 0.1,
        brushAlphaTo: 0.01,

        noisePowerFrom: 0.0,
        noisePowerTo: 1.0,

        noiseScaleFrom: 0.02,
        noiseScaleTo: 0.002,

        brushDensityMultiplier: 1.0
    };

    optionOverride(o, _options);

    let strokeDensity = o.strokeDensity;

    let circularLayers = int(_radius * 0.5 * strokeDensity);

    for (let i = 0; i < circularLayers; i++) {
        let layerT = (i + 1) / circularLayers;

        let nowRadius = _radius * layerT;

        let strokeCount = nowRadius * 2 * PI * strokeDensity;

        for (let s = 0; s < strokeCount; s++) {

            let circleT = s / strokeCount;
            let nowAngle = circleT * TWO_PI;

            let xPos = _x + sin(nowAngle) * nowRadius * 0.5;
            let yPos = _y + -cos(nowAngle) * nowRadius * 0.5;

            let nowNoiseScale = lerp(o.noiseScaleFrom, o.noiseScaleTo, layerT);

            let offsetNoiseValue = noise(xPos * nowNoiseScale, yPos * nowNoiseScale, 666);
            let nowNoisePower = lerp(o.noisePowerFrom, o.noisePowerTo, layerT);

            xPos += sin(nowAngle) * offsetNoiseValue * nowNoisePower * nowRadius;
            yPos += -cos(nowAngle) * offsetNoiseValue * nowNoisePower * nowRadius;


            let nowBrushDensity = lerp(o.brushDensityFrom, o.brushDensityTo, layerT);
            let nowBrushSize = lerp(o.brushSizeFrom, o.brushSizeTo, layerT);
            let nowBrushAlpha = lerp(o.brushAlphaFrom, o.brushAlphaTo, layerT);

            noFill();
            strokeBrush(xPos, yPos, nowBrushSize, o.brushLength, nowBrushDensity * o.brushDensityMultiplier);

            if (s % 10 == 0)
                await sleep(1);
        }
    }
}

async function fillBG(_fromColor, _toColor, _centerColor, _centerRadius) {
    let bgXDensity = 0.3;
    let bgYDensity = 0.6;

    let xCount = width * bgXDensity;
    let yCount = height * bgYDensity;

    let centerX = width / 2;
    let centerY = height / 2;

    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {

            push();

            let xt = x / (xCount - 1);
            let yt = y / (yCount - 1);

            let xPos = lerp(0, width, xt);
            let yPos = lerp(0, height, yt);

            yPos += noise(xPos * 0.003, yPos * 0.003) * 0.4 * height;

            let nowColor = NYLerpColor(_fromColor, _toColor, yt);
            let nowH = nowColor.h + random(-10, 10);
            let nowS = nowColor.s + random(-10, 10);
            let nowB = nowColor.b + random(-10, 10);

            stroke(nowH, nowS, nowB);
            strokeBrush(xPos, yPos, 30, 0.003);
            pop();
        }

        await sleep(1);
    }
}

function strokeBrush(_x, _y, _r, _strokeLength = 8, _density = 0.1) {
    let dotCount = _r * _r * PI * _density;

    for (let i = 0; i < dotCount; i++) {
        push();

        let dotX = randomGaussian(_x, _r);
        let dotY = randomGaussian(_y, _r);

        let angle = getAngle(dotX, dotY, CENTER_X, CENTER_Y) + 90;

        let angleNoise = noise(dotX * STROKE_ALIGN_NOISE_SCALE, dotY * STROKE_ALIGN_NOISE_SCALE);
        angle += lerp(-180, 180, angleNoise) * STROKE_ALIGN_NOISE_POWER;
        
        let xFrom = dotX + sin(radians(angle)) * _strokeLength * -0.5;
        let yFrom = dotY - cos(radians(angle)) * _strokeLength * -0.5;

        let xTo = dotX + sin(radians(angle)) * _strokeLength * 0.5;
        let yTo = dotY - cos(radians(angle)) * _strokeLength * 0.5;

        

        line(xFrom, yFrom, xTo, yTo);
        // point(dotX, dotY);
        pop();
    }
}
