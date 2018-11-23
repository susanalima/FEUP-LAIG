class Vehicle extends CGFobject {


    constructor(scene) {
        super(scene);
        var controlpointsTop = [
        [-1.5, -1.5, 0.0],  //0
        [-1.5, 1.5, 0.0],  //1
        [0, -1.5, 2.5],    //2
        [0, 1.5, 2.5],    //3
        [1.5, -1.5, 0.0],  //4
        [1.5, 1.5, 0.0]    //5
        ]

        this.top = new Patch(scene, 3, 2, 20, 20, controlpointsTop);

        var controlpointsBase = [[-1.5, -1.5, 0.0],  //0
        [-1.5, 1.5, 0.0],  //1
        [0, -1.5, 1],    //2
        [0, 1.5, 1],    //3
        [1.5, -1.5, 0.0],  //4
        [1.5, 1.5, 0.0]    //5
        ]

        this.base = new Patch(scene, 3, 2, 20, 20, controlpointsBase);

        var controlpointsFrontBase = [

            [-1.5, 1.5, 0.0],
            [-0.8, 3, 0.0],
            [0, 3, 0.0],

            [0, 1.5, 1],
            [0, 3, 0.0],
            [0, 3, 0.0],

            [1.5, 1.5, 0.0],  //0
            [0.8, 3, 0.0],
            [0, 3, 0.0],//
        ]
        this.frontBase = new Patch(scene, 3, 3, 20, 20, controlpointsFrontBase);

        var controlpointsTopFront = [

            [-1.5, 1.5, 0.0],
            [-0.8, 3, 0.0],
            [0, 3, 0.0],

            [0, 1.5, 2.5],
            [0, 3, 0.0],
            [0, 3, 0.0],

            [1.5, 1.5, 0.0],  //0
            [0.8, 3, 0.0],
            [0, 3, 0.0],//
        ]

        this.frontTop = new Patch(scene, 3, 3, 20, 20, controlpointsTopFront);

        this.cylinder = new MyCylinder(scene,20,10,0.8,0.8,0.4,2);

        this.circle = new MyCylinderBase(scene,20,0.55);

        this.explosionTexture = new CGFtexture(this.scene, "./scenes/images/lava.png");
        this.vertexTexture = new CGFtexture(this.scene, "./scenes/images/waves.jpg")
        this.explosionShader = new CGFshader(this.scene.gl, "waterShader.vert", "fragShader.frag");
        this.explosionShader.setUniformsValues({ uSampler2: 4 });
        this.explosionShader.setUniformsValues({ uSampler1: 5 });
        this.explosionShader.setUniformsValues({ normScale: this.heightscale });
        

    };

    display() {

        this.scene.pushMatrix();
        
        this.explosionTexture.bind(4);
        this.explosionTexture.bind(5);

        this.scene.rotate(-Math.PI/2,1,0,0);
        this.scene.scale(0.55,0.55,0.55);
    
        this.scene.pushMatrix();
        this.top.display();
        this.scene.rotate(-Math.PI, 0, 1, 0);
        this.base.display();
        this.frontBase.display();
        this.scene.rotate(-Math.PI, 0, 1, 0);
        this.frontTop.display();
        this.scene.rotate(Math.PI,1,0,0);
        this.frontBase.display();
        this.scene.rotate(-Math.PI, 0, 1, 0);
        this.frontTop.display();   
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(2,1,-0.2);
        this.scene.pushMatrix();
        this.scene.translate(0.15,0,0.2);
        this.circle.display();
        this.scene.rotate(Math.PI,0,1,0);
        this.circle.display();
        this.scene.popMatrix();
        this.cylinder.display(); 

        this.scene.translate(0,-2,0);
        this.scene.pushMatrix();
        this.scene.translate(0.15,0,0.2);
        this.circle.display();
        this.scene.rotate(Math.PI,0,1,0);
        this.circle.display();
        this.scene.popMatrix();
        this.cylinder.display();

   
        this.scene.translate(-4.3,0,0);
        this.scene.pushMatrix();
        this.scene.translate(0.15,0,0.2);
        this.circle.display();
        this.scene.rotate(Math.PI,0,1,0);
        this.circle.display();
        this.scene.popMatrix();
        this.cylinder.display();

        
        this.scene.translate(0,2,0);
        this.scene.pushMatrix();
        this.scene.translate(0.15,0,0.2);
        this.circle.display();
        this.scene.rotate(Math.PI,0,1,0);
        this.circle.display();
        this.scene.popMatrix();
        this.cylinder.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
    
    }
};