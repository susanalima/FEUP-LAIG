class CircularAnimation extends Animation{

    constructor(time, centerX, centerY, centerZ, radius, startang, rotang){
        super();
        this.type = "Circular";
        this.centerX = centerX;
        this.centerY = centerY;
        this.centerZ = centerZ;
        this.radius = radius;
        this.startang = startang*Math.PI/180;
        this.rotang = rotang*Math.PI/180;
        this.time = time;
        this.distance = this.calculateDistance();
        this.end = false;
        //this.deltang = this.startang;
        //this.angularV = this.rotang/this.time;
    }

    calculateDistance()
    {
        return this.radius*Math.PI*2;
    }

    update(currTime)
    {
        var deltaT;
        if(this.lastTime == null)
            deltaT = currTime;
        else
        {
          deltaT = currTime - this.lastTime;
        }

        this.animate(deltaT);
        this.lastTime = currTime;
        
    }

    animate(deltaT){
        //this.deltang = this.startang + this.angularV*deltaT;
        var deltaDistance = this.distance*deltaT/this.time;
        this.rotang = this.rotang + deltaDistance;
      
    }

   

}