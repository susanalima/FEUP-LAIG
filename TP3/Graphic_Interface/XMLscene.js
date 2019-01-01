var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.lightValues = {};
        this.currTime = 0;
        this.mode = 1;
        this.level = 1;
        this.startGame = false;
        this.reset = false;
        this.camera_rotation = 0;   
        this.undo_play = false;
        this.showGameMovie = false;
    }


    new_game()
    {
        this.startGame = true;
        this.reset = true;
    }

    undo()
    {
        this.undo_play = true;
    }

    game_movie()
    {
        this.showGameMovie = true;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();
        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        
        this.setUpdatePeriod(20);
        
        this.setPickEnabled(true);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }

    initLights() {
        var i = 0;
        // Lights index.

    
        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.


            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];
                //lights are predefined in cgfscene
                this.lights[i].setPosition(light.location[0], light.location[1], light.location[2], light.location[3]);
                this.lights[i].setAmbient(light.ambient[0], light.ambient[1], light.ambient[2], light.ambient[3]);
                this.lights[i].setDiffuse(light.diffuse[0], light.diffuse[1], light.diffuse[2], light.diffuse[3]);
                this.lights[i].setSpecular(light.specular[0], light.specular[1], light.specular[2], light.specular[3]);
                if (light.class == 'spot')
                {
                    this.lights[i].setSpotExponent(light.exponent);
                    this.lights[i].setSpotCutOff(light.angle*Math.PI/180);
                    let x = light.target[0] - light.location[0];
                    let y = light.target[1] - light.location[1];
                    let z = light.target[2] - light.location[2];
                    this.lights[i].setSpotDirection(x,y,z);
                }
                this.lights[i].setVisible(true);

                if (light.enable)
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        } 
  
    }


    /* Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        // this.camera.near = this.graph.near;
        // this.camera.far = this.graph.far;

        //Change reference length according to parsed graph
        this.axis = new CGFaxis(this, this.graph.axisLength);

        //Change ambient and background details according to parsed graph
        this.gl.clearColor(this.graph.backgroundAmbient[0], this.graph.backgroundAmbient[1], this.graph.backgroundAmbient[2], this.graph.backgroundAmbient[3]);
        this.setGlobalAmbientLight(this.graph.ambientAmbient[0], this.graph.ambientAmbient[1], this.graph.ambientAmbient[2], this.graph.ambientAmbient[3]);

        this.initLights();

        this.initParsedCameras();

        // Adds lights group.
        this.interface.addLightsGroup(this.graph.lights);
       

        this.interface.addViewsGroup();

        this.sceneInited = true;
    }


    initParsedCameras() {
        this.v = [];

        for (var key in this.graph.views.views) {
            this.v.push(key);
        }
        var defaultCam = this.graph.views.default;
        var defaultPerspective = this.graph.views.views[defaultCam];
        if (defaultPerspective != null) {
            this.camera = defaultPerspective;
        }
        this.currentview = defaultCam;
        this.interface.setActiveCamera(this.camera);
    }

    checkKeys()
	{
        if ( this.gui.isKeyPressed("KeyM"))
		{
            this.graph.updateComponentsCurrentMaterialIndex();
            this.interface.releaseKeyUp("KeyM");
        }

    }

    update(currTime)
    {
        this.currTime = currTime;
        if (this.camera_rotation > 0) {
            this.camera.orbit([0, 1, 0], Math.PI / 32);
            this.camera_rotation--;
        }
    }

    logPicking(){
        if (this.pickMode == false) {
            if (this.pickResults != null && this.pickResults.length > 0) {
                for (var i=0; i< this.pickResults.length; i++) {
                    var obj = this.pickResults[i][0];
                    console.log(obj);
                    if (obj)
                    {
                        var customId = this.pickResults[i][1];				
                        console.log("Picked object: " + obj + ", with pick id " + customId);
                    }
                }
                this.pickResults.splice(0,this.pickResults.length);
            }		
        }
        this.pickedIndex =  customId;
    }


    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.logPicking();
        this.clearPickRegistration();
        this.pickIndex = 0;

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        if (this.sceneInited) {
            // Draw axis
            this.axis.display();

            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    }
                    else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }

            if (this.camera != this.graph.views.views[this.currentview]) {
                this.camera = this.graph.views.views[this.currentview];
                this.interface.setActiveCamera(this.camera);
            }


            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }
        else {
            // Draw axis
            this.axis.display();
        }

        this.checkKeys();

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}