class LinearAnimation extends Animation{

    
    constructor(controlPoints, time){
        this.controlPoints = controlPoints;
        this.segment = 0;
        this.time = time;
        this.lastTime = null;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.distance = this.getDistanceTotal(controlPoints);
        this.prevDistances = 0;
    }

    getDistanceSegment(index){
        
        deltaX = controlPoints[index+1][0] - controlPoints[index][0];
        deltaY = controlPoints[index+1][1] - controlPoints[index][1];

        return Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY, 2));
    }

    getDistanceTotal(controlPoints){
        
        var totalDistance = 0;

        for(var i = 0; i < controlPoints.length- 1; i++)
            totalDistance += this.getDistanceSegment(i);

        return totalDistance;
    }

    getAngle(index)
    {

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

    animate(deltaT){
        deltaDistance = this.distance*deltaT/this.time;
        if(this.controlPoints[segment][0] < this.controlPoints[segment + 1][0])
          x = x; //dummy

    }

}