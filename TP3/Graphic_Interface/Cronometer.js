

class Cronometer extends CGFobject{
    constructor(scene, center, fullTime, text1, text2)
    {
        super(scene);
        this.x = center[0];
        this.y = center[1];
        this.z = center[2];
        this.angle = 0;
        this.actualTime = 0; //ms
        this.fullTime = fullTime; //ms
        this.text1 = text1;
        this.text2 = text2;

        this.clockPointer = new MyTriangle(this.scene, -0.5,-6,0,0,6,0,0.5,-6,0);
        this.clock = new MyCylinderBase(this.scene, 20, 10);
    }

    updateTime(newT){
        if(newT != null){
        this.actualTime = newT;
        if(this.actualTime > this.fullTime)
            this.actualTime = this.fullTime;
        this.angle = this.actualTime * 2 * Math.PI / this.fullTime;
        }
    }

    resetTimer()
    {
        this.actualTime = 0;
    }

    displayElements()
    {
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y,this.z);
        this.scene.rotate(-3 * Math.PI/4, 0,1,0);

        this.scene.pushMatrix();   

        this.scene.rotate(Math.PI/4, 0,0,1);
        this.scene.rotate(Math.PI/4, 0,0,1);

        this.text2.bind();
        this.clock.display();
        this.scene.popMatrix();
        this.scene.pushMatrix();
        this.scene.rotate(this.angle, 0,0,1);

        this.scene.translate(-0.01,3.8,-0.01);

        this.text1.bind();
        this.clockPointer.display();
        this.scene.popMatrix();
        this.scene.popMatrix();


    }
    display(){
        this.scene.pushMatrix();
        this.displayElements();
        this.scene.rotate(Math.PI,0,1,0);
        this.displayElements();
        this.scene.popMatrix();

    }
}