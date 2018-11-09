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
        this.distance;
    
        var vector1 = this.getVector(0);
        this.angle = this.calcAngle(vector1,[0,1]);
        
        this.distanceComponents = [0,0];
        this.prevDistances = 0;
        this.end = false;
        this.getDistanceComponents();
    }

    getDistanceSegment(index) {

        let deltaX = this.controlPoints[index + 1][0] - this.controlPoints[index][0];
        let deltaZ = this.controlPoints[index + 1][2] - this.controlPoints[index][2];

        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaZ, 2));
    }

    getDistanceTotal() {

        var totalDistance = 0;

        for (var i = 0; i < this.controlPoints.length - 1; i++)
            totalDistance += this.getDistanceSegment(i);

        return totalDistance;
    }

    getDistanceComponents(){
        let vec2, vec1 = [0,0];
        for(let ind= 0; ind < this.controlPoints.length - 1; ind++)
        {
            vec2 = this.getVector(ind);
            this.distanceComponents[0] += Math.abs(vec2[0] - vec1[0]);
            this.distanceComponents[1] += Math.abs(vec2[1] - vec1[1]);
            vec1 = vec2;
        }
    }

    getVector(index) {
        if (index >= this.controlPoints - 1) {
            console.log("ERROR: this.index of control point out of range!\n");
            return;
        }
        let vector = [this.controlPoints[index + 1][0] - this.controlPoints[index][0], this.controlPoints[index + 1][2] - this.controlPoints[index][2]];
        return vector;
    }

    getCos() {
        return this.controlPoints[this.index][0] / Math.sqrt(Math.pow(this.controlPoints[this.index][0], 2) + Math.pow(this.controlPoints[this.index][2], 2));
    }

    calcAngle(vector1, vector2)
    {
      let v1_x = vector1[0];
      let v1_z = vector1[1];
      let v2_x = vector2[0];
      let v2_z = vector2[1];

      let n_v1 = Math.sqrt(v1_x*v1_x + v1_z*v1_z);
      let n_v2 = Math.sqrt(v2_x*v2_x + v2_z*v2_z);

      let cos = (v1_x*v2_x + v1_z*v2_z)/(n_v1*n_v2);
      return Math.acos(cos);
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
        if (this.point >= this.maxPoint) {
            deltaDist = 0;
        }
        else {
            this.distance = this.getDistanceTotal();
            var deltaDistX = this.distanceComponents[0] * deltaT / this.time;
            var deltaDistZ = this.distanceComponents[1] * deltaT / this.time;
            deltaDist = this.distance * deltaT / this.time;
            this.segment += deltaDist;
            if (this.segment >= this.getDistanceSegment(this.index)) {
                deltaDist -= (this.segment - this.getDistanceSegment(this.index));
                this.segment = 0;
                //this.angle = this.calcAngle(this.controlPoints[this.index],this.controlPoints[this.index+1]);
                //console.log(this.index);
                this.index++;
                this.point++;
            }
        this.prevDistances += deltaDist;
        
        this.x += deltaDistX;
        this.z += deltaDistZ;
        console.log('angle: ' + this.angle);
        //console.log('X:' + this.x);
        //console.log('Z:' + this.z);
        } 
    }
}