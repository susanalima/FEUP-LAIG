class LinearAnimation extends Animation{

    
    constructor(controlPoints, time){
        this.controlPoints = controlPoints;
        this.time = time;
        this.lastTime = null;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.distance = 0;
        this.prevDistances = 0;
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

    animate(){

    }

}