class Animation{

    constructor(time){
        this.time = time*1000;
    }
    
    restart() {
        this.lastTime = null;
    }

    update(currTime) {
        var deltaT;
        if (this.lastTime == null)
            deltaT = 0;
        else {
            deltaT = currTime - this.lastTime;
        }
        this.apply(deltaT);
        this.lastTime = currTime;
    }

    apply(deltaT)
    {

    }

}