
/**
 * LinearAnimation class represents a linear animation
 */
class LinearAnimation extends Animation {

    /**
     * Class constructor of LinearAnimation
     * @param {Object} controlPoints Array of the control points
     * @param {Object} time Length of the animation in seconds
     */
    constructor(controlPoints, time) {
        super(time);
        this.type = "Linear";
        this.controlPoints = controlPoints;
        this.normalizeZeros();
        this.maxPoint = this.controlPoints.length - 1;
        this.distance = this.getDistanceTotal();
        this.vectors = [];
        this.getVectors();
        console.dir(this.vectors);
        this.restart();
    }

    /**
     * Restarts the animation by changing the class member values to the start values
     */
    restart() {
        super.restart();
        this.segment = 0;
        this.point = 0;
        this.x = this.controlPoints[0][0];
        this.y = this.controlPoints[0][1];
        this.z = this.controlPoints[0][2];
        this.index = 0;
        this.end = false;
        this.angle = this.calcAngle(this.vectors[0], [0, 1]);
    }

    /**
     * Normalizes the zeros from the controlpoints vector when necessary
     */
    normalizeZeros() {
        for (let i = 0; i < this.controlPoints.length; i++) {
            if (this.controlPoints[i][0] == 0 && this.controlPoints[i][1] != 0 && this.controlPoints[i][2] == 0)
                this.controlPoints[i][2] = 0.001;
        }
    }

    /**
    * Returns the length of the segment of the animation being used 
    * @param {Object} index Index of the segment of the animation
    */
    getDistanceSegment(index) {

        let deltaX = this.controlPoints[index + 1][0] - this.controlPoints[index][0];
        let deltaZ = this.controlPoints[index + 1][2] - this.controlPoints[index][2];
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaZ, 2));
    }


    /**
     * Returns the vertical length of the segment of the animation being used 
     * @param {Object} index Index of the segment of the animation
     */
    getDistanceVertical(index) {
        return this.controlPoints[index + 1][1] - this.controlPoints[index][1];
    }


    /**
     * Returns the total distance travelled in the animation
     */
    getDistanceTotal() {

        var totalDistance = 0;

        for (var i = 0; i < this.controlPoints.length - 1; i++)
            totalDistance += this.getDistanceSegment(i);

        return totalDistance;
    }

    /**
    * Returns an array of arrays. The arrays represent the vectors of the translations correspondent to each of the animation segments
    */
    getVectors() {
        for (let i = 0; i < this.controlPoints.length - 1; i++) {
            let v = this.getVector(i);
            this.vectors.push(v);
        }
    }

    /**
     * Calculates the angle between to vectors given as arguments
     * @param {Array} vector1 Array which represent a segments' vector
     * @param {Array} vector2 Array which represent a segments' vector
     */
    getVector(index) {
        if (index >= this.controlPoints - 1) {
            console.log("ERROR: this.index of control point out of range!\n");
            return;
        }
        let vector = [this.controlPoints[index + 1][0] - this.controlPoints[index][0], this.controlPoints[index + 1][2] - this.controlPoints[index][2]];
        return vector;
    }

    /**
     * Calculates the angle between to vectors given from the vectors array
     * @returns {Object} angle calculated
     */
    calcAngleIndex(index) {
        let v1 = [this.vectors[index][0], this.vectors[index][1]];
        let v2 = [this.vectors[index + 1][0], this.vectors[index + 1][1]];
        return this.calcAngle(v1, v2);
    }

    /**
    * Calculates the angle between to vectors given as arguments
    * @param {Array} vector1 Array which represent a segments' vector
    * @param {Array} vector2 Array which represent a segments' vector
    */
    calcAngle(vector1, vector2) {
        let v1_x = vector1[0];
        let v1_z = vector1[1];
        let v2_x = vector2[0];
        let v2_z = vector2[1];

        let n_v1 = Math.sqrt(v1_x * v1_x + v1_z * v1_z);
        let n_v2 = Math.sqrt(v2_x * v2_x + v2_z * v2_z);

        let cos = (v1_x * v2_x + v1_z * v2_z) / (n_v1 * n_v2);
        return Math.acos(cos);
    }


    /**
       * Updates the class members according to the time passed between calls of this function
       * @param {Object} deltaT 
       */
    apply(deltaT) {
        let deltaDistX;
        let deltaDistY;
        let deltaDistZ;
        let deltaVertical;
        if (this.end == true)
            return;
        if (this.index >= this.maxPoint) {
            this.end = true;
            return;
        }
        var deltaDistance = this.distance * deltaT / this.time;
        var distSegment = this.getDistanceSegment(this.index);
        deltaVertical = this.getDistanceVertical(this.index);
        this.segment += deltaDistance;
        if (this.segment > distSegment) {
            deltaDistance -= (this.segment - distSegment);
            deltaDistX = deltaDistance * Math.sin(this.angle);
            deltaDistY = deltaVertical * deltaDistance / distSegment;
            deltaDistZ = deltaDistance * Math.cos(this.angle);
            if (this.index < this.maxPoint - 1)
                this.angle += this.calcAngleIndex(this.index);
            this.index++;
            this.segment = 0;
        }
        else {
            deltaDistX = deltaDistance * Math.sin(this.angle);
            deltaDistY = deltaVertical * deltaDistance / distSegment;
            deltaDistZ = deltaDistance * Math.cos(this.angle);
        }
        this.x += deltaDistX;
        this.y += deltaDistY;
        this.z += deltaDistZ;
    }
}