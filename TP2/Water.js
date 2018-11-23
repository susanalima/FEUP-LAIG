class Water extends CGFobject{
    
    constructor(scene,parts,heightscale){
        super(scene);
        this.scene = scene;
        this.texture = new CGFtexture(this.scene, "./scenes/images/water_texture.jpg");
        this.heightmap= new CGFtexture(this.scene, "./scenes/images/waves.jpg")

        this.parts = 20;
        this.heightscale = heightscale;
        this.plane = new Plane(scene,parts,parts);
        this.wave_time = 2;
        this.lastTime = null;
        
        this.testShader = new CGFshader(this.scene.gl,"waterShader.vert", "waterShader.frag");
        
        this.testShader.setUniformsValues({uSampler2: 1});
        this.testShader.setUniformsValues({uSampler1: 2});
        this.testShader.setUniformsValues({normScale: this.heightscale});

  
    }


    display(){
    
       //let timeFactor = this.scene.currTime/800.0 % 1;
      // let timeFactor = Math.sin(this.scene.currTime/10000)*0.5 + 0.5;
      let timeFactor = (Math.sin((this.scene.currTime/10000) % 512*2));
       this.testShader.setUniformsValues({time:timeFactor}); 
       this.scene.setActiveShader(this.testShader);
        this.scene.pushMatrix();
        this.texture.bind(2);
        this.heightmap.bind(1);
        this.scene.scale(10,10,1);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}