/**
 * CircularAnimation class represents a circular animation
 */
class CircularAnimation extends Animation {

    /**
     * Class constructor of CircularAnimation
     * @param {Object} time Length of the animation in seconds
     * @param {Object} centerX X coordinate of the circular center
     * @param {Object} centerY Y coordinate of the circular center
     * @param {Object} centerZ Z coordinate of the circular center
     * @param {Object} radius radius 
     * @param {Object} startang inital angle in degrees
     * @param {Object} rotang total angle of rotation in degrees
     */
    constructor(time, centerX, centerY, centerZ, radius, startang, rotang) {
        super(time);
        this.type = "Circular";
        this.radius = radius;
        this.startang = startang * Math.PI / 180;
        this.rotang = rotang * Math.PI / 180;
        this.centerX = centerX;
        this.centerY = centerY;
        this.centerZ = centerZ;
        this.restart();
    }

    /**
     * Restarts the animation by changing the class member values to the start values
     */
    restart() {
        super.restart();
        this.x = this.centerX + this.radius * Math.cos(this.startang);
        this.y = this.centerY;
        this.z = this.centerZ + this.radius * Math.sin(this.startang);
        this.end = false;
        this.angle = this.startang;
    }

     /**
     * Updates the class members according to the time passed between calls of this function
     * @param {Object} deltaT 
     */
    apply(deltaT) {
        let deltaAngle = this.rotang * deltaT / this.time;
        this.angle += deltaAngle;
        if (this.angle > (this.startang + this.rotang)) {
            this.angle = this.startang + this.rotang;
            this.end = true;
        }     
        this.x = this.radius * Math.cos(this.angle);
        this.z = this.radius * Math.sin(this.angle);
    }
}