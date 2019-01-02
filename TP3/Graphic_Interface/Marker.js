class Marker extends CGFobject{
    constructor(scene, center)
    {
        super(scene);
        this.x = center[0];
        this.y = center[1];
        this.z = center[2];
        
        this.p1 = 0;
        this.p2 = 0;

        this.bodyText = new CGFtexture(this.scene, "./scenes/images/blue.png");

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

        this.body = new MyRectangle(this.scene, -10,-8,10,8);

        this.marker1 = new MyRectangle(this.scene, -4,-3,4,3);
        this.marker2 = new MyRectangle(this.scene, -4,-3,4,3);
    }

    resetWins(){
        this.p1 = 0;
        this.p2 = 0;
    }

    display(){
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y,this.z);
        this.scene.rotate( Math.PI/4, 0,1,0);

        this.bodyText.bind();
        this.body.display();
       
        this.scene.pushMatrix();
        this.scene.translate(-5,0,0.01);
        this.textures[this.p1].bind();
        this.marker1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(5,0,0.01);
        this.textures[this.p2].bind();
        this.marker2.display();
        this.scene.popMatrix();

        this.scene.popMatrix();


    }
}