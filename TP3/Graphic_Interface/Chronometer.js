
/**
 * Class chronometer responsible for showing how much time a player has to make a play
 */
class Chronometer extends CGFobject {
    constructor(scene, center, fullTime, text1, text2) {
        super(scene);
        this.x = center[0];
        this.y = center[1];
        this.z = center[2];
        this.angle = 0;
        this.actualTime = 0; //ms
        this.fullTime = fullTime; //ms
        this.text1 = text1;
        this.text2 = text2;

        this.clockPointer = new MyTriangle(this.scene, -0.5, -6, 0, 0, 6, 0, 0.5, -6, 0);
        this.back = new MyCylinder(scene, 40, 1, 10.5, 10.5, 5),
            this.support_back = new MyCylinder(this.scene, 4, 1, 4, 4, 3.5);

        this.clock = new MyCylinderBase(this.scene, 40, 10);
    }

    /**
     * Updates the time of the chronometer with newT
     * @param {int} newT New time of the chronometer
     */
    updateTime(newT) {
        if (newT != null) {
            this.actualTime = newT;
            if (this.actualTime > this.fullTime)
                this.actualTime = this.fullTime;
            this.angle = this.actualTime * 2 * Math.PI / this.fullTime;
        }
    }

    /**
     * Resets the chronometer
     */
    resetTimer() {
        this.actualTime = 0;
    }

    /**
     * Displays the elements of one chronometer
     */
    displayElements() {
        this.scene.pushMatrix();

        this.scene.translate(this.x, this.y, this.z);
        this.scene.rotate(Math.PI / 3, 0, 1, 0);
        this.scene.rotate(Math.PI / 4, 1, 0, 0);
        this.scene.scale(0.4, 0.4, 0.4);
        this.scene.translate(10, 0, 0);

        this.scene.pushMatrix();
        this.scene.translate(0, 0, 0.2);
        this.back.display();
        this.scene.translate(0, -2, 8);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.support_back.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.scale(-1, 1, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.rotate(Math.PI / 4, 0, 0, 1);


        this.text2.bind();
        this.scene.rotate(-Math.PI / 4, 0, 0, 1);
        this.clock.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();

        this.scene.scale(-1, 1, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);


        this.scene.rotate(this.angle, 0, 0, 1);
        this.scene.translate(0.01, 3.8, 0.01);

        this.text1.bind();
        this.clockPointer.display();
        this.scene.popMatrix();
        this.scene.popMatrix();


    }

    /**
     * Displays both chronometers of the game
     */
    display() {
        this.scene.pushMatrix();

        this.displayElements();
        this.scene.rotate(-Math.PI, 0, 1, 0);
        this.displayElements();
        this.scene.popMatrix();

    }
}