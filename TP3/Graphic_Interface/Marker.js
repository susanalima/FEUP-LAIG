
/**
 * Class marker is responsible for showing whose turn is it and the game score
 */
class Marker extends CGFobject{
    constructor(scene, center)
    {
        super(scene);
        this.x = center[0];
        this.y = center[1];
        this.z = center[2];
        
        this.pUnits1 = 0;
        this.pUnits2 = 0;
        this.pDozens1 = 0;
        this.pDozens2 = 0;

        this.indicatorFlag = true;

        this.bodyText = new CGFtexture(this.scene, "./scenes/images/blue.png");
        this.indicatorText = new CGFtexture(this.scene, "./scenes/images/red.png");

        let tex0 = new CGFtexture(this.scene, "./scenes/images/marker0.png");
        let tex1 = new CGFtexture(this.scene, "./scenes/images/marker1.png");
        let tex2 = new CGFtexture(this.scene, "./scenes/images/marker2.png");
        let tex3 = new CGFtexture(this.scene, "./scenes/images/marker3.png");
        let tex4 = new CGFtexture(this.scene, "./scenes/images/marker4.png");
        let tex5 = new CGFtexture(this.scene, "./scenes/images/marker5.png");
        let tex6 = new CGFtexture(this.scene, "./scenes/images/marker6.png");
        let tex7 = new CGFtexture(this.scene, "./scenes/images/marker7.png");
        let tex8 = new CGFtexture(this.scene, "./scenes/images/marker8.png");
        let tex9 = new CGFtexture(this.scene, "./scenes/images/marker9.png");

        this.textures = [tex0,tex1,tex2,tex3,tex4,tex5,tex6,tex7,tex8,tex9];

        this.body = new MyRectangle(this.scene, -15,-8,15,8);
        this.indicator1 = new MyTriangle(this.scene,  -1,0,0,0,1,0,1,0,0);
        this.indicator2 = new MyTriangle(this.scene,  -1,0,0,0,1,0,1,0,0);

        this.markerUnits1 = new MyRectangle(this.scene, -3,-4.5,3,4.5);
        this.markerUnits2 = new MyRectangle(this.scene, -3,-4.5,3,4.5);
        this.markerDozens1 = new MyRectangle(this.scene, -3,-4.5,3,4.5);
        this.markerDozens2 = new MyRectangle(this.scene, -3,-4.5,3,4.5);
    }

    /**
     * Resets the number of wins of both players
     */
    resetWins(){
        this.pUnits1 = 0;
        this.pUnits2 = 0;
        this.pDozens1 = 0;
        this.pDozens2 = 0;
    }

    /**
     * Checks if the number of wins of each player surpasses 10 updates the class info accordingly
     * @param {int} units class member representing units of one of the players score
     * @param {int} dozens class member representing dozens of one of the players score
     */
    checkDozens(units, dozens){
        if(units >= 10)
        {
            dozens++;
            units = 0;
        }
    }

    /**
     * Switchs the turn
     */
    switchPlayer(){
        this.indicatorFlag = !this.indicatorFlag;
    }

    /**
     * Displays both markers needed for the game
     */
    display(){
        this.checkDozens(this.pUnits1, this.pDozens1);
        this.checkDozens(this.pUnits2, this.pDozens2);
        
        this.scene.pushMatrix();
        this.displayElements();
        this.scene.rotate(Math.PI, 0,1,0);
        this.displayElements();
        this.scene.popMatrix();


    }

    /**
     * Displays the elements of one of the markers
     */
    displayElements(){
        this.scene.pushMatrix();
    
        this.scene.translate(this.x, this.y,this.z);
        this.scene.rotate( Math.PI/3, 0,1,0);
        this.scene.rotate( -Math.PI/4, 1,0,0);
        this.scene.scale(0.5,0.5,0.5);
       // this.scene.rotate( Math.PI/4, 0,1,0);
       this.scene.translate(30,0,0);
        this.bodyText.bind();
        this.body.display();
       
        this.scene.pushMatrix();
        this.scene.translate(-5,0,0.01);
        this.textures[this.pUnits1].bind();
        this.markerUnits1.display();
        this.scene.translate(-6.1,0,0.01);
        this.textures[this.pDozens1].bind();
        this.markerDozens1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(5,0,0.01);
        this.textures[this.pDozens2].bind();
        this.markerDozens2.display();
        this.scene.translate(6.1,0,0.01);
        this.textures[this.pUnits2].bind();
        this.markerUnits2.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();

        this.scene.translate(-8,0,0.01);
        this.scene.translate(0,6,0);
        this.scene.rotate(Math.PI, 1,0,0);

        this.indicatorText.bind();
        if(this.indicatorFlag)
            this.indicator1.display();
        else{
            this.scene.translate(16,0,0);
            this.indicator2.display();
        }
        this.scene.popMatrix();

        this.scene.popMatrix();
    }
}