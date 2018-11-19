/**
 * MyCylinder (regular) to be changed 
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

/**
 * MyCylinder2BodyClass is used to represent the side of a cylinder
 */
class MyCylinder2Body extends CGFobject {
	/**
	 * Constructor for MyCylinderBody class
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
        this.calculateControlPoints();
        console.dir(this.controlPoints);
        this.getControlVertexes();
        this.makeSurface();
    };

    calculateControlPoints(){
        let angle = 0;
        let xb,yb,xt,yt;
        let z = 0;

        let points = [];
        for(let i = 0; i < 9; i++)
        {
            xb = this.base*Math.cos(angle);
            yb = this.base*Math.sin(angle);
            xt = this.top*Math.cos(angle);
            yt = this.top*Math.sin(angle);
            points.push([xb,yb,z,1],[xt,yt,this.height,1]);
            angle += Math.PI/4;
        }
        this.controlPoints = points;
    }


    getControlVertexes()
    {
        for(let j = 0; j < this.npoints_u; j++)
        {
            let tmpvert = [];
            for(let i = 0; i < this.npoints_v; i++ ){
                this.controlPoints[i + j*this.npoints_v].push(1);
                tmpvert.push(this.controlPoints[i + j*this.npoints_v]);
            }
               
            this.controlVertexes.push(tmpvert);
        }
         
    }

    makeSurface(){
        var nurbsSurface = new CGFnurbsSurface(this.degree1,this.degree2, this.controlVertexes);
        this.cylinder2 = new CGFnurbsObject(this.scene, this.nparts_u, this.nparts_v, nurbsSurface);

    }

    display(){
        this.cylinder2.display();
    }

    




};