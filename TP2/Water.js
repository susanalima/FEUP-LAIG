class Water extends CGFobject {


    //return new Water(this.scene,texture,map,water.parts, water.heightscale,water.texscale);

    
    constructor(scene,texture,wavemap, parts, heightscale,textscale) {
        super(scene);
        this.scene = scene;
        //this.texture = new CGFtexture(this.scene, "./scenes/images/water_texture.jpg");
        //this.heightmap = new CGFtexture(this.scene, "./scenes/images/waves.jpg")
        this.texture = texture;
        this.wavemap = wavemap;
        this.parts = parts;
        this.heightscale = heightscale;
        this.textscale = textscale;
        this.plane = new Plane(scene, this.parts, this.parts);
        this.wave_time = 2;
        this.lastTime = null;

        this.testShader = new CGFshader(this.scene.gl, "waterShader.vert", "waterShader.frag");

        this.testShader.setUniformsValues({ uSampler2: 1 });
        this.testShader.setUniformsValues({ uSampler1: 2 });
        this.testShader.setUniformsValues({ normScale: this.heightscale });


    }


    display() {

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        //let timeFactor = this.scene.currTime/800.0 % 1;
        // let timeFactor = Math.sin(this.scene.currTime/10000)*0.5 + 0.5;
        let timeFactor = (Math.sin((this.scene.currTime / 10000) % 512 * 2));
        this.testShader.setUniformsValues({ time: timeFactor });
        this.scene.setActiveShader(this.testShader);
        this.scene.pushMatrix();
        this.texture.bind(2);
        this.wavemap.bind(1);
        this.plane.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
        this.scene.popMatrix();
    }
}