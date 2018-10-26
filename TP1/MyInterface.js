/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)
        this.initKeys();

        return true;
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {

        var group = this.gui.addFolder("Lights");
        group.open();

        // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
        // e.g. this.option1=true; this.option2=false;

        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                if (lights[key].enabled == 0)
                    this.scene.lightValues[key] = false;
                if (lights[key].enabled== 1)
                    this.scene.lightValues[key] = true;
                group.add(this.scene.lightValues, key);
            }
        }
    }

    addViewsGroup()
    {
        this.gui.add(this.scene,'currentview',this.scene.v);
    }

    /**
	 * processKeyboard
	 * @param event {Event}
	 */
	initKeys() {
		this.scene.gui=this;
		this.processKeyboard=function(){};
		this.activeKeys={};
	}

    /**
     * Processes the event of pressing a keyboard key
     * @param {*} event the event received
     */
	processKeyDown(event) {
		this.activeKeys[event.code]=true;
	};

	processKeyUp(event) {
		//this.activeKeys[event.code]=false;
    };
    
     /**
     * Processes the event of releasing a pressed keyboard key
     * @param {*} event the event received
     */
    releaseKeyUp(keyCode)
    {
        this.activeKeys[keyCode]=false;
    };
    
    /**
     * Function that checks if the key given as argument is being held down
     * @param {*} keyCode Key code of the key beig checked
     */
	isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;  
    };
    
}