class Water extends CGFobject{
    
    constructor(scene,parts,heightscale){
        super(scene);
        this.scene = scene;
        //this.texture = new CGFtexture(this.scene, "./scenes/images/height_map.jpg");
        this.texture = new CGFtexture(this.scene, "./scenes/images/water_texture.jpg");
        this.heightmap= new CGFtexture(this.scene, "./scenes/images/waves.jpg")
        //this.texture = new CGFtexture(this.scene, "./scenes/images/vulcano.jpg");
        //this.texture = new CGFtexture(this.scene, "./scenes/images/metal.png");
        this.parts = parts;
        this.heightscale = heightscale;
        this.plane = new Plane(scene,parts,parts);
        this.wave_time = 2;
        this.lastTime = null;
        
        this.testShader = new CGFshader(this.scene.gl,"vertexShader.vert", "fragShader.frag");
        
        this.testShader.setUniformsValues({uSampler2: 1});
        this.testShader.setUniformsValues({normScale: this.heightscale});

  
    }

    update(currTime) {
        var deltaT;
        if (this.lastTime == null)
            deltaT = 0;
        else
            deltaT = currTime - this.lastTime;
        this.animate(deltaT);
        this.lastTime = currTime;
    }


    display(){
        this.scene.setActiveShader(this.testShader);
        this.scene.pushMatrix();
        this.texture.bind(1);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}