/**
 * MyCylinder2
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

/**
 * MyCylinder2 Class is used to represent a cylinder2
 */
class MyCylinder2 extends CGFobject {
	/**
	 * Constructor for MyCylinder2 class
	 * @param {Object} scene Scene where the object will be displayed
	 * @param {Object} slices Number of slices of the cylinder, in other words, the number of sides of the polygon
	 * @param {Object} stacks Number of stacks that constitute the cylinder.
	 * @param {Object} base Radius of the base
	 * @param {Object} top Radius of the top
	 * @param {Object} height Length of the cylinder
	 */
	constructor(scene, slices, stacks, base, top, height) {
		super(scene);
		this.height = height;
		this.base = base;
        this.top = top;
        this.npoints_u = 9;
        this.npoints_v = 2;
        this.degree1 = 8;
        this.degree2 = 1;
        this.nparts_u = slices;
        this.nparts_v = stacks;
        this.controlPoints = [];
        this.controlVertexes = [];
        this.getControlVertexes();
        this.makeSurface();
    };

    /**
     * Creates the 9 control vertexes necessary to create the cylinder
     */
    getControlVertexes(){
        this.controlVertexes = [
            [[this.base,0,0,1],[this.top,0,this.height,1]],
            [[this.base,this.base,0,0.707],[this.top,this.top,this.height,0.707]],
            [[0,this.base,0,1],[0,this.base,this.height,1]],
            [[-this.base,this.base,0,0.707],[-this.top,this.top,this.height,0.707]],
            [[-this.base,0,0,1],[-this.base,0,this.height,1]],
            [[-this.base,-this.base,0,0.707],[-this.top,-this.top,this.height,0.707]],
            [[0,-this.base,0,1],[0,-this.base,this.height,1]],
            [[this.base,-this.base,0,0.707],[this.top,-this.top,this.height,0.707]],
            [[this.base,0,0,1],[this.top,0,this.height,1]]
        ];
    }

    /**
     * Creates a new CGFnurbsObject from the information obtained
     */
    makeSurface(){
      
        var nurbsSurface = new CGFnurbsSurface(this.degree1,this.degree2, this.controlVertexes);
        this.cylinder2 = new CGFnurbsObject(this.scene, this.nparts_u, this.nparts_v, nurbsSurface);
    }

    /**
     * Displays the cylinder
     */
    display(){
        this.scene.pushMatrix();
        this.cylinder2.display();
        this.scene.popMatrix();
    }
};