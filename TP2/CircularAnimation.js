class CircularAnimation extends Animation {

    constructor(time, centerX, centerY, centerZ, radius, startang, rotang) {
        super();
        this.type = "Circular";
        this.radius = radius;
        this.startang = startang * Math.PI / 180;
        this.rotang = rotang * Math.PI / 180;
        this.centerX = centerX;
        this.centerY = centerY;
        this.centerZ = centerZ;
        this.time = time;
        this.restart();
    }

    restart() {
        this.x = this.centerX + this.radius * Math.cos(this.startang);
        this.y = this.centerY;
        this.z = this.centerZ + this.radius * Math.sin(this.startang);
        this.distance = this.calculateDistance();
        this.end = false;
        this.angle = this.startang;
    }

    calculateDistance() {
        return this.radius * Math.PI * 2;
    }

    update(currTime) {
        var deltaT;
        if (this.lastTime == null)
            deltaT = 0;
        else {
            deltaT = currTime - this.lastTime;
        }

        this.animate(deltaT);
        this.lastTime = currTime;

    }

    animate(deltaT) {
        let deltaAngle = this.rotang * deltaT / this.time;
        this.angle += deltaAngle;

        if (this.angle > (this.startang + this.rotang)) {
            this.angle = this.startang + this.rotang;
            this.end = true;
        }
        
            this.x = this.radius * Math.cos(this.angle);
            this.z = this.radius * Math.sin(this.angle);
            console.log('X: ' + this.x);
            console.log('Z: ' + this.z);
        

    }
}