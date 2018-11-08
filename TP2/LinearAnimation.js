class LinearAnimation extends Animation{

    constructor(controlPoints, time){
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
        this.distance = this.getDistanceTotal();
        this.prevDistances = 0;
        this.end = false;
    }

    getDistanceSegment(index){
        
        let deltaX = this.controlPoints[index+1][0] - this.controlPoints[index][0];
        let deltaY = this.controlPoints[index+1][1] - this.controlPoints[index][1];

        return Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY, 2));
    }

    getDistanceTotal(){
        
        var totalDistance = 0;

        for(let i = 0; i < this.controlPoints.length - 1; i++)
            totalDistance += this.getDistanceSegment(i);

        return totalDistance;
    }

    getVector(index){
        if(index >= this.controlPoints - 1){
            console.log("ERROR: index of control point out of range!\n");
            return;
        }
        vector[2] = [this.controlPoints[index+1][0] - this.controlPoints[index][0], this.controlPoints[index+1][1] - this.controlPoints[index][1]];
        return vector;
    }

    getCos(index)
    {
        return this.controlPoints[index][0]/sqrt(Math.pow(this.controlPoints[index][0],2) + Math.pow(this.controlPoints[index][1],2));
    }

    update(currTime)
    {
        var deltaT;
        if(this.lastTime == null)
            deltaT = 0;
        else 
            deltaT = currTime - this.lastTime;
        this.animate(deltaT);
        this.lastTime = currTime;
        
    }

    animate(deltaT){
        let deltaDistance = 5*deltaT/this.time;
    
            this.x += deltaDistance;
            console.log(deltaDistance);
       
    }


}