/**
 * MyCylinder2Body 
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

/**
 * MyCylinder2Body Class is used to represent the side of a cylinder2
 */
class MyCylinder2Base extends CGFobject {
	/**
	 * Constructor for MyCylinder2Body class
	 * @param {Object} scene Scene where the object will be displayed
	 * @param {Object} slices Number of slices of the cylinder, in other words, the number of sides of the polygon
	 * @param {Object} stacks Number of stacks that constitute the cylinder.
	 * @param {Object} base Radius of the base
	 * @param {Object} top Radius of the top
	 * @param {Object} height Length of the cylinder
	 */
	constructor(scene, slices, radius)  {
		super(scene);

		this.radius = radius;
        this.npoints_u = 9;
        this.npoints_v = 1;
        this.degree1 = 8;
        this.degree2 = 0;
        this.nparts_u = slices;
        this.nparts_v = slices;
        this.controlPoints = [];
        this.controlVertexes = [];
        this.calculateControlPoints();
        console.dir(this.controlPoints);
        this.getControlVertexes();
        console.dir(this.controlVertexes);
        this.makeSurface();
    };

    //TODO refactoring
    calculateControlPoints(){
        let angle = 0;
        let x,y;
        let z = 0;

        let points = [];
        for(let i = 0; i < 9; i++)
        {
           
            x = this.radius*Math.cos(angle);
            y = this.radius*Math.sin(angle);
            points.push([x,y,z]);
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
        console.dir(this.controlVertexes);
         
    }

    makeSurface(){
        var nurbsSurface = new CGFnurbsSurface(this.degree1,this.degree2, this.controlVertexes);
        this.cylinder2 = new CGFnurbsObject(this.scene, this.nparts_u, this.nparts_v, nurbsSurface);

    }

    display(){
        this.cylinder2.display();
    }

    




};