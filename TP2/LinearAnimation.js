class LinearAnimation extends Animation {

    constructor(controlPoints, time) {
        super();
        this.controlPoints = controlPoints;
        this.segment = 0;
        this.point = 0;
        this.maxPoint = this.controlPoints.length - 1;
        this.time = time;
        this.lastTime = null;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.index = 0;
        this.distance = this.getDistanceTotal();
        this.prevDistances = 0;
        this.end = false;
    }

    getDistanceSegment(i) {

        let deltaX = this.controlPoints[i + 1][0] - this.controlPoints[i][0];
        let deltaY = this.controlPoints[i + 1][1] - this.controlPoints[i][1];

        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    }

    getDistanceTotal() {

        var totalDistance = 0;

        for (let i = 0; i < this.controlPoints.length - 1; i++)
            totalDistance += this.getDistanceSegment(i);

        return totalDistance;
    }

    getVector() {
        if (this.index >= this.controlPoints - 1) {
            console.log("ERROR: this.index of control point out of range!\n");
            return;
        }
        vector[2] = [this.controlPoints[this.index + 1][0] - this.controlPoints[this.index][0], this.controlPoints[this.index + 1][1] - this.controlPoints[this.index][1]];
        return vector;
    }

    getCos() {
        return this.controlPoints[this.index][0] / Math.sqrt(Math.pow(this.controlPoints[this.index][0], 2) + Math.pow(this.controlPoints[this.index][1], 2));
    }

    update(currTime) {
        var deltaT;
        if (this.lastTime == null)
            deltaT = 0;
        else
            deltaT = currTime - this.lastTime;
        this.animate(deltaT);
        this.lastTime = currTime;

    }

    animate(deltaT) {
        let deltaDist;
        if (this.point > this.maxPoint) {
            deltaDist = 0;
        }
        else {
            deltaDist = this.totalDistance * deltaT / this.time;
            this.segment += deltaDist;
            if (this.segment > this.getDistanceSegment()) {
                deltaDist -= (this.segment - this.getDistanceSegment());
                this.segment = 0;
                this.index++;
                this.point++;
            }
            this.prevDistances += deltaDist;
        }
        this.x += deltaDist * this.getCos();
        this.z += deltaDist * Math.sqrt(1 - Math.pow(this.getCos(), 2));
        console.log(deltaDist);
    }
}