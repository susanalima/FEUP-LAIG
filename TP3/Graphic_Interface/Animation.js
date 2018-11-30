/**
 * Abstract class Animation represents an animation. Is used as a super class for LinearAnimation and CircularAnimation
 */
class Animation{

    /**
     * Class constructor of Animation
     * @param {Integer} time Length in seconds of the animation
     */
    constructor(time){
        this.time = time*1000;
    }
    
    /**
     * Restarts the animation by changing the clas members to start values
     */
    restart() {
        this.lastTime = null;
    }

    /**
     * Calculates the amount of time passed between calls of this function
     * @param {Object} currTime Current time represented in seconds 
     */
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

    /**
     * Abstract function used to change class members of the animation
     * @param {Object} deltaT Delta time, amount of time passed between calls of this function
     */
    apply(deltaT)
    {

    }

}