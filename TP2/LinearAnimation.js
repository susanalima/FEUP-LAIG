class LinearAnimation extends Animation {

    constructor(controlPoints, time) {
        super(time);
        this.type = "Linear";
        this.controlPoints = controlPoints;
        this.distance = this.getDistanceTotal();
        this.vectors = [];
        this.getVectors();
        this.restart();
    }

    restart() {
        super.restart();
        this.x = this.controlPoints[0][0];
        this.y = this.controlPoints[0][1];
        this.z = this.controlPoints[0][2];
        this.end = false;
        this.angle = this.calcAngle(this.vectors[0],[0,1]);
        this.index = 0;
        this.maxIndex = this.controlPoints.length - 1;
    }


    getVectors()
    {
        for(let i = 0; i < this.controlPoints.length - 1; i++)
        {
            let v = this.getVector(i);
            this.vectors.push(v);    
        }
    }

    getVector(index) {
        if (index >= this.controlPoints - 1) {
            console.log("ERROR: this.index of control point out of range!\n");
            return;
        }
        let vector = [this.controlPoints[index + 1][0] - this.controlPoints[index][0],this.controlPoints[index + 1][2] - this.controlPoints[index][2]];
        return vector;
    }

 
    calcAngle(vector1, vector2)
    {
      let v1_x = vector1[0];
      let v1_z = vector1[1];
      let v2_x = vector2[0];
      let v2_z = vector2[1];

      let n_v1 = Math.sqrt(v1_x*v1_x + v1_z*v1_z);
      let n_v2 = Math.sqrt(v2_x*v2_x + v2_z*v2_z);

      if(n_v1 == 0 || n_v2 == 0)
        return 0;

      let cos = (v1_x*v2_x + v1_z*v2_z)/(n_v1*n_v2);
      return Math.acos(cos);
    }

    getDistanceSegment(index) {
        let deltaX = this.getDeltaX(index)
        let deltaY = this.getDeltaY(index);
        let deltaZ = this.getDeltaZ(index);
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY,2)  + Math.pow(deltaZ, 2));
    }

    getDistanceTotal() {
        var totalDistance = 0;
        for (var i = 0; i < this.controlPoints.length - 1; i++)
            totalDistance += this.getDistanceSegment(i);
        return totalDistance;
    }

    getDeltaX(index) {
        return this.controlPoints[index + 1][0] - this.controlPoints[index][0];
    }

    getDeltaY(index) {
        return this.controlPoints[index + 1][1] - this.controlPoints[index][1];
    }

    getDeltaZ(index) {
        return this.controlPoints[index + 1][2] - this.controlPoints[index][2];
    }

    getCurrentDist(deltaX,deltaY,deltaZ) {
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY,2)  + Math.pow(deltaZ, 2));
    }


    apply(deltaT){
        if(this.index >= this.maxIndex)
            this.end = true;
         if(this.end == true)
            return;
        
        console.log('index ' + this.index);
        let deltaDistX,deltaDistY,deltaDistZ, currentDist;
        deltaDistX = this.getDeltaX(this.index)*deltaT/this.time;
        deltaDistY = this.getDeltaY(this.index)*deltaT/this.time;
        deltaDistZ = this.getDeltaZ(this.index)*deltaT/this.time;
        var distSegment = this.getDistanceSegment(this.index);
        currentDist = this.getCurrentDist(this.x,this.y,this.z);

        console.log('distSeg : ' + distSegment);
        console.log('currentDist : ' + currentDist);

        if (this.currentDist >= distSegment)
        {
           if(this.index < this.maxIndex -1)
                this.angle += this.calcAngle(this.vectors[this.index], this.vectors[this.index +1]);
            this.index++;
        }

        this.x += deltaDistX;
        this.y += deltaDistY;
        this.z += deltaDistZ;

        console.log('X : ' + this.x);
        console.log('Y : ' + this.y);
        console.log('Z : ' + this.z);
         
          
           
    }
}