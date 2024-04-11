class NYColor {
    constructor(_h, _s, _b, _a = 1.0) {
        this.h = _h;
        this.s = _s;
        this.b = _b;
        this.a = _a;
    }

    copy() {
        return new NYColor(this.h, this.s, this.b, this.a);
    }

    slightRandomize(_hDiff = 10, _sDiff = 12, _bDiff = 12, _aDiff = 0.0) {
        this.h += random(-0.5 * _hDiff, 0.5 * _hDiff);
        this.s += random(-0.5 * _sDiff, 0.5 * _sDiff);
        this.b += random(-0.5 * _bDiff, 0.5 * _bDiff);
        this.a += random(-0.5 * _aDiff, 0.5 * _aDiff);

        this.h = processHue(this.h);
    }

    color() {
        return color(this.h, this.s, this.b, this.a);
    }

    static newRandomColor(_mainHue) {
        let h = processHue(_mainHue + random(-80, 80));
        let s = random(40, 100);
        let b = random(60, 100);

        return new NYColor(h, s, b);
    }
}

class TreeNode {
    constructor(_x, _y, _length, _options = {}) {
        this.options = {
            'fromWidth': 20,
            'toWidth': 5,

            'nodeCount': 10,
            'maxBranchDepth': 3,
            'nowSplitDepth': 0,

            'splitBranches': int(random(2, 6)),


            'startAngle': 0,
            'angleRangeFrom': -180,
            'angleRangeTo': 180,
            
            'turnSpeed': 0.01,
            'turnNoiseScale': 0.02,
            'turnZSeed': int(random(0, 1000000)),

            'turnNoiseScale': 0.02,

            'noiseZSeed': int(random(0, 1000000)),

            'drawStep': 1,
        };

        optionOverride(this.options, _options);

        this.x = _x;
        this.y = _y;

        this.totalLength = _length;
        this.drawnLength = 0;
        this.drawnT = 0;

        this.nowAngle = this.options.startAngle;
        this.turnSpeed = this.options.turnSpeed;

        this.target = null;
        this.targetDistance = 0;

        this.splitPoses = [];
        if (this.options.nowSplitDepth < this.options.maxBranchDepth) {
            for (let i = 0; i < this.options.splitBranches; i++) {
                this.splitPoses.push(random(0.2, 0.95));
            }
            this.splitPoses.sort();
        }
        this.nowSplitCheckIndex = 0;
        this.nowSplitSide = int(random(0, 2));

        this.childNodes = [];

        this.isFinished = false;
    }

    split() {
        let newBranchLength = (this.totalLength - this.drawnLength) * random(0.6, 1.6);
        let newOptions = {};
        newOptions.fromWidth = lerp(this.options.fromWidth, this.options.toWidth, this.drawnT);
        newOptions.toWidth = this.options.toWidth * 0.5;
        newOptions.nowSplitDepth = this.options.nowSplitDepth + 1;

        if (this.nowSplitSide == 0) {
            newOptions.startAngle = this.nowAngle + random(0, 90);
        }
        else {
            newOptions.startAngle = this.nowAngle - random(0, 90);
        }
        let newNode = new TreeNode(this.x, this.y, newBranchLength, newOptions);
        this.childNodes.push(newNode);
    }

    step() {
        for (let i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].isAllFinished() == false) {
                this.childNodes[i].step();
            }
        }

        if (!this.isFinished) {
            this.x += sin(radians(this.nowAngle)) * this.options.drawStep;
            this.y -= cos(radians(this.nowAngle)) * this.options.drawStep;

            let nowNoiseValue = noise(this.x * this.options.turnNoiseScale, this.y * this.options.turnNoiseScale, this.options.noiseZSeed);
            let newAngle = lerp(this.options.angleRangeFrom, this.options.angleRangeTo, nowNoiseValue);

            this.nowAngle = lerp(this.nowAngle, newAngle, this.turnSpeed);

            this.drawnLength += this.options.drawStep;
            this.drawnT = this.drawnLength / this.totalLength;

            if (this.drawnT >= 1.0)
                this.isFinished = true;

            // check split
            if (this.nowSplitCheckIndex < this.splitPoses.length) {
                if (this.drawnT > this.splitPoses[this.nowSplitCheckIndex]) {
                    this.split();
                    this.nowSplitCheckIndex++;
                }
            }
        }
    }

    isAllFinished() {
        // check self first
        if (this.isFinished == false)
            return false;

        // check children
        let allFinished = true;
        for (let i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].isFinished == false) {
                allFinished = false;
                break;
            }
        }

        return allFinished;
    }

    draw() {
        for (let i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].isAllFinished() == false) {
                this.childNodes[i].draw();
            }
        }

        if (this.isFinished == false) {
            push();
            translate(this.x, this.y);
            rotate(radians(this.nowAngle));

            // noStroke();
            // fill('black');
            stroke('black');
            let nowWidth = lerp(this.options.fromWidth, this.options.toWidth, this.drawnT);
            // rect(-0.5 * nowWidth, -0.25 * nowWidth, nowWidth, nowWidth * 0.5);
            strokeBrush(0, 0, nowWidth * 0.5, 0.2);
            

            noFill();
            stroke(0, 0, 100, random(0.1, 0.7));
            let lightBrushSize = nowWidth * 0.2;
            strokeBrush(0 + 0.3 * nowWidth, 0, lightBrushSize, 0.2);
            pop();
        }
    }
}