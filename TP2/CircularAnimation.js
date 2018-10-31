class CircularAnimation extends Animation{

    constructor(centerX, centerY, centerZ, radius, initialAngle, rotation, time){
        this.centerX = centerX;
        this.centerY = centerY;
        this.centerZ = centerZ;
        this.radius = radius;
        this.initialAngle = initialAngle*Math.PI/180;
        this.rotation = rotation*Math.PI/180;
        this.time = time;
    }


    update(currTime)
    {
        if(this.lastTime == null)
            deltaT = currTime;
        else
            deltaT = currTime - this.lastTime;

        animate(deltaT);
        this.lastTime = currTime;
        
    }

}